import { ExposureSource } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { maskValue } from "../lib/maskValue";
import { calculateSourceDistribution, formatSourceDistributionLog } from "../helper/sourceAnalyzer";
import { confidenceForSource, mapPlatformToIngredientKey } from "../helper/IngredientMapper";

const log = (...args: any[]) => console.log(new Date().toISOString(), ...args);
const warn = (...args: any[]) => console.warn(new Date().toISOString(), ...args);
const error = (...args: any[]) => console.error(new Date().toISOString(), ...args);

// Process the orchestration scan data
export async function processScanData(scanJson: any, userId: string) {
    log("Processing scan data for user:", userId);
    try {
        const allIngredients = await prisma.threatIngredient.findMany({
            include: { threatCategory: true }
        });
        log(`Loaded ${allIngredients.length} threat ingredients`);
        const ingredientKeyMap = new Map<string, { id: string, threatCategoryId: string, name: string }>();
        for (const ing of allIngredients) {
            ingredientKeyMap.set(ing.key, { id: ing.id, threatCategoryId: ing.threatCategoryId, name: ing.name });
        }
        log(`Built ingredient key map with ${ingredientKeyMap.size} entries`);

        // Helper to create an exposure record
        async function createExposureRecord(ingredientKey: string, opts: {
            value?: string | null;
            source: ExposureSource;
            evidenceUrl?: string;
            evidenceSnippet?: string;
            confidence?: number;
        }) {
            const map = ingredientKeyMap.get(ingredientKey);
            if (!map) {
                warn(`No ThreatIngredient found (NOT SEEDED) for key: ${ingredientKey}`);
                return null;
            }
            const result = await prisma.userIngredientExposure.create({
                data: {
                    userId,
                    ingredientId: map.id,
                    source: opts.source,
                    evidenceUrl: opts.evidenceUrl || null,
                    evidenceSnippet: opts.evidenceSnippet || null,
                    confidence: opts.confidence || confidenceForSource(opts.source),
                    detectedAt: new Date(),
                    valueMasked: maskValue(ingredientKey, opts.value ?? "")
                }
            });
            log(`Created exposure record id=${result.id} ingredient=${ingredientKey} (mapped:${map.id}) source=${opts.source}`);
            return result;
        }

        // extract ingredient exposures from scanJson
        const createdExposures: Array<any> = [];
        try {
            const eb = scanJson?.results?.emailBreach?.data?.data;
            if (eb && eb.email) {
                // email leaked via breach
                createdExposures.push(await createExposureRecord("email_id", {
                    value: eb.email,
                    source: "BREACH",
                    evidenceUrl: eb.breaches?.[0]?.domain ?? null,
                    evidenceSnippet: eb.breaches?.[0]?.description ?? null,
                    confidence: 0.95
                }));

                // if breaches list contains "Passwords" in dataClasses or pwn info, add password_leak too
                const firstBreach = eb.breaches?.[0];
                if (firstBreach) {
                    const classes = firstBreach.dataClasses || [];
                    if (classes.some((c: string) => /password/i.test(c))) {
                        createdExposures.push(await createExposureRecord("password_leak", {
                            value: null,
                            source: "BREACH",
                            evidenceUrl: firstBreach.domain ?? null,
                            evidenceSnippet: firstBreach.title ?? null,
                            confidence: 0.9
                        }));
                    }
                }
            }
        } catch (e) {
            warn("emailBreach parse error", e);
        }

        // Password check part 
        try {
            const pw = scanJson?.results?.passwordCheck?.data?.data;
            if (pw && (pw.isPwned === true || pw.pwnCount > 0)) {
                createdExposures.push(await createExposureRecord("password_leak", {
                    value: null,
                    source: "BREACH",
                    evidenceSnippet: `pwnCount=${pw.pwnCount}; severity=${pw.severity || pw.severity}`,
                    confidence: pw.pwnCount > 1000 ? 0.95 : 0.85
                }));
            }
        } catch (e) {
            warn("passwordCheck parse error", e);
        }

        // Web presence from Google
        try {
            const wp = scanJson?.results?.webPresenceGoogle?.data?.data;
            if (wp && Array.isArray(wp.findings)) {
                for (const f of wp.findings) {
                    const platform = f.platform || f.platformType || "OTHER";
                    const platformType = f.platformType || null;
                    const ingredientKey = mapPlatformToIngredientKey(f.platform, platformType);

                    createdExposures.push(await createExposureRecord(ingredientKey, {
                        value: f.profileName ?? f.url ?? null,
                        source: "WEB",
                        evidenceUrl: f.url ?? null,
                        evidenceSnippet: f.snippet ?? null,
                        confidence: f.exposureLevel === "HIGH" ? 0.85 : (f.exposureLevel === "MEDIUM" ? 0.7 : 0.55)
                    }));
                }
            }
        } catch (e) {
            console.warn("webPresenceGoogle parse error", e);
        }

        // fallback mapping for common social/professional platforms
        const platformFallbackMap: Record<string, string> = {
            linkedin: "linkedin_id",
            github: "github_profile",
            instagram: "instagram_profile",
            facebook: "facebook_profile",
            twitter: "twitter_profile",
            x: "twitter_profile",
            youtube: "youtube_channel",
            telegram: "telegram_username",
            whatsapp: "whatsapp_number"
        };

        function fallbackPlatformToIngredient(platform?: string | null) {
            if (!platform) return undefined;
            const key = platform.toLowerCase().replace(/\s+/g, "");
            return platformFallbackMap[key];
        }

        // helper to scan arbitrary text for common identifiers and create exposures
        async function extractIdentifiersFromText(text: string | null | undefined, src: ExposureSource) {
            if (!text) return;
            try {
                const t = text as string;

                // phone: + and digits or 7-15 digit sequences
                const phoneRegex = /(?:\+?\d[\d\s\-()]{6,}\d)/g;
                const phones = t.match(phoneRegex) || [];
                for (const p of phones) {
                    await createExposureRecord("phone_number", { value: p.trim(), source: src, evidenceSnippet: t, confidence: 0.85 });
                }

                // PAN (India-like) pattern: 5 letters 4 digits 1 letter
                const panRegex = /\b[a-zA-Z]{5}\d{4}[a-zA-Z]\b/g;
                const pans = t.match(panRegex) || [];
                for (const p of pans) {
                    await createExposureRecord("pan_number", { value: p.trim(), source: src, evidenceSnippet: t, confidence: 0.9 });
                }

                // Aadhaar (12 digits)
                const aadhaarRegex = /\b\d{12}\b/g;
                const ads = t.match(aadhaarRegex) || [];
                for (const a of ads) {
                    await createExposureRecord("aadhaar_number", { value: a.trim(), source: src, evidenceSnippet: t, confidence: 0.9 });
                }

                // UPI id simple heuristic: something like name@bank
                const upiRegex = /[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}/g;
                const upis = t.match(upiRegex) || [];
                for (const u of upis) {
                    await createExposureRecord("upi_id", { value: u.trim(), source: src, evidenceSnippet: t, confidence: 0.8 });
                }
            } catch (e) {
                warn("identifier extraction error", e);
            }
        }

        // Enhanced parsing of Google findings (with fallbacks and identifier extraction)
        try {
            const wp = scanJson?.results?.webPresenceGoogle?.data?.data;
            if (wp && Array.isArray(wp.findings)) {
                for (const f of wp.findings) {
                    const platform = f.platform || f.platformType || "OTHER";
                    const platformType = f.platformType || null;
                    let ingredientKey = mapPlatformToIngredientKey(f.platform, platformType);
                    if (!ingredientKey) ingredientKey = fallbackPlatformToIngredient(platform) ?? "web_mentions";

                    createdExposures.push(await createExposureRecord(ingredientKey, {
                        value: f.profileName ?? f.url ?? null,
                        source: "WEB",
                        evidenceUrl: f.url ?? null,
                        evidenceSnippet: f.snippet ?? null,
                        confidence: f.exposureLevel === "HIGH" ? 0.85 : (f.exposureLevel === "MEDIUM" ? 0.7 : 0.55)
                    }));

                    // also scan snippet/title/url for identifiers
                    await extractIdentifiersFromText(f.snippet ?? f.title ?? f.url ?? null, "WEB");
                }
            }
        } catch (e) {
            warn("webPresenceGoogle enhanced parse error", e);
        }

        // Web presence from Perplexity
        try {
            const wp2 = scanJson?.results?.webPresencePerplexity?.data?.data ?? scanJson?.results?.webPresencePerplexity?.data ?? scanJson?.results?.webPresencePerplexity;
            if (wp2 && typeof wp2 === "object") {
                const sm = wp2.socialMediaAccounts as any[] | undefined;
                const prof = wp2.professionalInfo as any | undefined;
                const pers = wp2.personalInfo as any | undefined;
                const others = wp2.otherOnlinePresence as any[] | undefined;

                if (Array.isArray(sm)) {
                    for (const acc of sm) {
                        if (!acc || acc.hasAccount !== true) continue;
                        const platformName = acc.platform ?? acc.platformName ?? acc.platform_type ?? acc.name ?? "other";
                        let ingredientKey = mapPlatformToIngredientKey(platformName as string, null);
                        if (!ingredientKey) ingredientKey = fallbackPlatformToIngredient(platformName) ?? "web_mentions";

                        createdExposures.push(await createExposureRecord(ingredientKey, {
                            value: acc.username ?? acc.url ?? acc.handle ?? acc.profileName ?? null,
                            source: "AI",
                            evidenceUrl: acc.url ?? null,
                            evidenceSnippet: acc.username ?? acc.bio ?? null,
                            confidence: 0.7
                        }));
                    }
                }

                if (prof) {
                    if (prof.linkedinUrl) {
                        await createExposureRecord("linkedin_id", { value: prof.linkedinUrl, source: "AI", evidenceUrl: prof.linkedinUrl, confidence: 0.85 });
                    }
                    if (prof.currentCompany) {
                        await createExposureRecord("company_name", { value: prof.currentCompany, source: "AI", evidenceSnippet: prof.position ?? null, confidence: 0.7 });
                    }
                    if (prof.position) {
                        await createExposureRecord("job_role_department", { value: prof.position, source: "AI", confidence: 0.65 });
                    }
                    if (prof.location) {
                        await createExposureRecord("work_location", { value: prof.location, source: "AI", confidence: 0.6 });
                    }
                }

                if (pers) {
                    if (pers.name) {
                        await createExposureRecord("full_name", { value: pers.name, source: "AI", confidence: 0.9 });
                    }
                    if (pers.phone) {
                        await createExposureRecord("phone_number", { value: pers.phone, source: "AI", confidence: 0.9 });
                    }
                    if (pers.address) {
                        await createExposureRecord("home_address", { value: pers.address, source: "AI", confidence: 0.8 });
                    }
                    if (Array.isArray(pers.education)) {
                        for (const edu of pers.education) {
                            // map simple heuristics
                            const eduStr = (edu || "").toString();
                            if (/college|university|institute/i.test(eduStr)) {
                                await createExposureRecord("college_name", { value: eduStr, source: "AI", confidence: 0.7 });
                            } else if (/school/i.test(eduStr)) {
                                await createExposureRecord("school_name", { value: eduStr, source: "AI", confidence: 0.7 });
                            } else {
                                await createExposureRecord("web_mentions", { value: eduStr, source: "AI", confidence: 0.5 });
                            }
                        }
                    }
                }

                if (Array.isArray(others)) {
                    for (const o of others) {
                        await createExposureRecord("web_mentions", { value: o, source: "AI", evidenceSnippet: o, confidence: 0.5 });
                    }
                }

                // scan raw research text if present for identifiers
                if (typeof wp2.rawResearch === "string") {
                    await extractIdentifiersFromText(wp2.rawResearch, "AI");
                }
            } else if (wp2 && wp2.data && Array.isArray(wp2.data.findings)) {
                // old shape: wp2.data.findings
                for (const f of wp2.data.findings) {
                    createdExposures.push(await createExposureRecord("web_mentions", {
                        value: f.title ?? f.url ?? null,
                        source: "AI",
                        evidenceUrl: f.url ?? null,
                        evidenceSnippet: f.snippet ?? null,
                        confidence: 0.5
                    }));
                    await extractIdentifiersFromText(f.snippet ?? f.title ?? f.url ?? null, "AI");
                }
            }
        } catch (e) {
            warn("webPresencePerplexity parse error", e);
        }

        const created = createdExposures.filter(Boolean);
        log(`Total exposures created: ${created.length}`);

        const threat = await prisma.threatCategory.findMany({
            include: { ingredients: true }
        });

        const assessmentToUpsert: Array<{
            threatId: string;
            score: number;
            matchedIngredients: string[];
        }> = [];

        const userExposures = await prisma.userIngredientExposure.findMany({
            where: { userId },
            include: { ingredient: true }
        });

        const matchedKeysSet = new Set<string>();
        for (const ue of userExposures) {
            const ingRecord = allIngredients.find(ing => ing.id === ue.ingredientId);
            if (ingRecord) {
                matchedKeysSet.add(ingRecord.key);
            }
        }
        for (const t of threat) {
            const total = t.ingredients.length || 1;
            const matched: string[] = [];

            for (const ing of t.ingredients) {
                if (matchedKeysSet.has(ing.key)) {
                    matched.push(ing.key);
                }
            }
            const score = Math.round((matched.length / total) * 100);
            if (score > 0) {
                assessmentToUpsert.push({
                    threatId: t.id,
                    score,
                    matchedIngredients: matched
                });
            }
        }
        log(`Prepared ${assessmentToUpsert.length} threat assessments to upsert`);

        // upsert threat assessments
        for (const a of assessmentToUpsert) {
            // check existing
            const existing = await prisma.threatAssessment.findFirst({
                where: { userId, threatId: a.threatId }
            });
            if (existing) {
                await prisma.threatAssessment.update({
                    where: { id: existing.id },
                    data: {
                        score: a.score,
                        matchedIngredients: a.matchedIngredients,
                        updatedAt: new Date()
                    }
                });
                log(`Updated threatAssessment id=${existing.id} threatId=${a.threatId} score=${a.score}`);
            } else {
                await prisma.threatAssessment.create({
                    data: {
                        userId,
                        threatId: a.threatId,
                        score: a.score,
                        matchedIngredients: a.matchedIngredients
                    }
                });
                log(`Created threatAssessment for threatId=${a.threatId} score=${a.score}`);
            }
        }
        const finalAssessments = await prisma.threatAssessment.findMany({
            where: { userId },
            include: {
                threat: {
                    select: {
                        key: true,
                        name: true
                    }
                }
            },
            orderBy: { score: "desc" }
        });
        const result = finalAssessments.map(assess => ({
            threatKey: assess.threat.key,
            threatName: assess.threat.name,
            score: assess.score,
            matchedIngredientKeys: assess.matchedIngredients
        }));

        // particular source distribution
        const sourceDistribution = await calculateSourceDistribution(userId);
        console.log(formatSourceDistributionLog(sourceDistribution));
        // dvs score calculation 
        // formula = (ingredients find / total ingredient ) * 100 + 30
        const totalIngredient = allIngredients.length;
        const ingredientFound = matchedKeysSet.size;

        let dvsScore = ((ingredientFound / totalIngredient) * 100) + 30;
        dvsScore = Math.min(dvsScore, 100);
        dvsScore = Math.round(dvsScore * 100) / 100;

        log(`DVS Score calculated: ${dvsScore}% (${ingredientFound}/${totalIngredient} ingredients found)`);

        log("Scan data processing complete for user:", userId);
        return {
            success: true,
            message: "Scan data processed successfully",
            exposures: created,
            sourceDistribution: {
                distributions: sourceDistribution.distributions,
                summary: sourceDistribution.summary
            },
            dvsScore: dvsScore,
            dvsBreakdown: {
                ingredientsFound: ingredientFound,
                totalIngredients: totalIngredient,
                percentage: Math.round((ingredientFound / totalIngredient) * 100 * 100) / 100
            },
            threatAssessments: result
        };
    } catch (err) {
        // err may be unknown shape; safely extract message or stringify
        const errMsg = (err as any)?.message ?? String(err);
        error("Error processing scan data for user:", userId, errMsg);
        throw err;
    }
}