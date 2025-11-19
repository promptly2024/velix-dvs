import { ExposureSource } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { maskValue } from "../lib/maskValue";

const log = (...args: any[]) => console.log(new Date().toISOString(), ...args);
const warn = (...args: any[]) => console.warn(new Date().toISOString(), ...args);
const error = (...args: any[]) => console.error(new Date().toISOString(), ...args);

// map platform strings from scan findings to ThreatIngredient keys (best-effort)
function mapPlatformToIngredientKey(platform: string, platformType: string | null) {
    const p = (platform || "").toLowerCase();
    const pt = (platformType || "").toUpperCase();

    if (p.includes("facebook")) return "facebook_profile";
    if (p.includes("instagram")) return "instagram_profile";
    if (p.includes("twitter") || p.includes("x/")) return "twitter_profile";
    if (p.includes("youtube")) return "youtube_channel";
    if (p.includes("reddit")) return "reddit_id";
    if (p.includes("telegram")) return "telegram_username";

    if (p.includes("whatsapp")) return "whatsapp_number";

    if (p.includes("github")) return "github_profile";

    if (pt === "PROFESSIONAL") {
        if (p.includes("linkedin")) return "linkedin_id";
        if (p.includes("github")) return "github_profile";
        return "company_name";
    }

    if (pt === "SOCIAL_MEDIA") {
        return "social_photos";
    }

    return "web_mentions";
}

// confidence heuristics by source
function confidenceForSource(source: ExposureSource) {
    switch (source) {
        case "BREACH": return 0.95;
        case "WEB": return 0.6;
        case "SOCIAL": return 0.65;
        case "AI": return 0.5;
        default: return 0.5;
    }
}

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

        // Web presence from Perplexity
        try {
            const wp2 = scanJson?.results?.webPresencePerplexity;
            if (wp2 && wp2.data && Array.isArray(wp2.data.findings)) {
                for (const f of wp2.data.findings) {
                    // generic mapping
                    createdExposures.push(await createExposureRecord("web_mentions", {
                        value: f.title ?? f.url ?? null,
                        source: "AI",
                        evidenceUrl: f.url ?? null,
                        evidenceSnippet: f.snippet ?? null,
                        confidence: 0.5
                    }));
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

        // dvs score calculation 
        // formula = (ingredients find / total ingredient ) * 100 + 30
        const totalIngredient = allIngredients.length;
        const ingredientFound = matchedKeysSet.size;

        let dvsScore = ((ingredientFound / totalIngredient) * 100 ) + 30;
        dvsScore = Math.min(dvsScore, 100);
        dvsScore = Math.round(dvsScore * 100) / 100;

        log(`DVS Score calculated: ${dvsScore}% (${ingredientFound}/${totalIngredient} ingredients found)`);

        log("Scan data processing complete for user:", userId);
        return {
            success: true,
            message: "Scan data processed successfully",
            exposures: created,
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