import { prisma } from "../lib/prisma";
import { maskValue } from "../lib/maskValue";
import { calculateSourceDistribution, formatSourceDistributionLog } from "../helper/sourceAnalyzer";
import { confidenceForSource, mapPlatformToIngredientKey } from "../helper/IngredientMapper";
import {  mapPerplexityResponse, extractIdentifiersFromText, fallbackPlatformToIngredient, MappedExposure, ExposureData } from "../helper/perplexityMapper";

const log = (...args: any[]) => console.log(new Date().toISOString(), ...args);
const warn = (...args: any[]) => console.warn(new Date().toISOString(), ...args);
const error = (...args: any[]) => console.error(new Date().toISOString(), ...args);

export async function processScanData(scanJson: any, userId: string) {
  log("Processing scan data for user:", userId);
  
  try {
    const allIngredients = await prisma.threatIngredient.findMany({
      include: { threatCategory: true }
    });
    log(`Loaded ${allIngredients.length} threat ingredients`);

    // Build ingredient key map
    const ingredientKeyMap = new Map<string, { id: string, threatCategoryId: string, name: string }>();
    for (const ing of allIngredients) {
      ingredientKeyMap.set(ing.key, { id: ing.id, threatCategoryId: ing.threatCategoryId, name: ing.name });
    }
    log(`Built ingredient key map with ${ingredientKeyMap.size} entries`);

    // Helper to create an exposure record
    async function createExposureRecord(ingredientKey: string, opts: ExposureData) {
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

    // Helper to process mapped exposures
    async function processMappedExposures(mappedExposures: MappedExposure[]) {
      const results = [];
      for (const mapped of mappedExposures) {
        const exposure = await createExposureRecord(mapped.ingredientKey, mapped.exposureData);
        if (exposure) {
          results.push(exposure);
        }
      }
      return results;
    }

    // Extract ingredient exposures from scanJson
    const createdExposures: Array<any> = [];

    // 1. Process Email Breach Data
    try {
      const eb = scanJson?.results?.emailBreach?.data?.data;
      if (eb && eb.email) {
        createdExposures.push(await createExposureRecord("email_id", {
          value: eb.email,
          source: "BREACH",
          evidenceUrl: eb.breaches?.[0]?.domain ?? null,
          evidenceSnippet: eb.breaches?.[0]?.description ?? null,
          confidence: 0.95
        }));

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

    // 2. Process Password Check
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

    // 3. Process Web Presence from Google
    try {
      const wp = scanJson?.results?.webPresenceGoogle?.data?.data;
      if (wp && Array.isArray(wp.findings)) {
        for (const f of wp.findings) {
          const platform = f.platform || f.platformType || "OTHER";
          const platformType = f.platformType || null;
          let ingredientKey = mapPlatformToIngredientKey(f.platform, platformType);
          
          if (!ingredientKey) {
            ingredientKey = fallbackPlatformToIngredient(platform) ?? "web_mentions";
          }

          createdExposures.push(await createExposureRecord(ingredientKey, {
            value: f.profileName ?? f.url ?? null,
            source: "WEB",
            evidenceUrl: f.url ?? null,
            evidenceSnippet: f.snippet ?? null,
            confidence: f.exposureLevel === "HIGH" ? 0.85 : (f.exposureLevel === "MEDIUM" ? 0.7 : 0.55)
          }));

          // Extract identifiers from snippet/title/url
          const textExposures = extractIdentifiersFromText(
            f.snippet ?? f.title ?? f.url ?? null, 
            "WEB"
          );
          const processed = await processMappedExposures(textExposures);
          createdExposures.push(...processed);
        }
      }
    } catch (e) {
      warn("webPresenceGoogle parse error", e);
    }

    // 4. Process Web Presence from Perplexity
    try {
      const perplexityData =
        scanJson?.results?.webPresencePerplexity?.data?.data ??
        scanJson?.results?.webPresencePerplexity?.data ??
        scanJson?.results?.webPresencePerplexity;

        log("\n\nPerplexity Data:", JSON.stringify(perplexityData, null, 2).slice(0, 100) + (JSON.stringify(perplexityData, null, 2).length > 100 ? "..." : ""));
      if (perplexityData) {
        const mappedExposures = mapPerplexityResponse(perplexityData, "AI");
        const processed = await processMappedExposures(mappedExposures);
        createdExposures.push(...processed);
        log(`Processed ${processed.length} exposures from Perplexity`);
      }
    } catch (e) {
      warn("webPresencePerplexity parse error", e);
    }

    // Filter out null values
    const created = createdExposures.filter(Boolean);
    log(`Total exposures created: ${created.length}`);

    // Load threat categories
    const threat = await prisma.threatCategory.findMany({
      include: { ingredients: true }
    });

    const assessmentToUpsert: Array<{
      threatId: string;
      score: number;
      matchedIngredients: string[];
    }> = [];

    // Get all user exposures
    const userExposures = await prisma.userIngredientExposure.findMany({
      where: { userId },
      include: { ingredient: true }
    });

    // Build matched keys set
    const matchedKeysSet = new Set<string>();
    for (const ue of userExposures) {
      const ingRecord = allIngredients.find(ing => ing.id === ue.ingredientId);
        if (ingRecord) {
          console.log(`\n\nUser exposure matched ingredient key: ${ingRecord.key}`);
        matchedKeysSet.add(ingRecord.key);
      }
    }

    // Calculate threat scores
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
    log(`\nPrepared ${assessmentToUpsert.length} threat assessments to upsert`);

    // Upsert threat assessments
    for (const a of assessmentToUpsert) {
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
        log(`\nUpdated threatAssessment id=${existing.id} threatId=${a.threatId} score=${a.score}`);
      } else {
        await prisma.threatAssessment.create({
          data: {
            userId,
            threatId: a.threatId,
            score: a.score,
            matchedIngredients: a.matchedIngredients
          }
        });
        log(`\nCreated threatAssessment for threatId=${a.threatId} score=${a.score}`);
      }
    }

    // Get final assessments
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

    // Calculate source distribution
    const sourceDistribution = await calculateSourceDistribution(userId);
    console.log(formatSourceDistributionLog(sourceDistribution));

    // Calculate DVS score
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
    const errMsg = (err as any)?.message ?? String(err);
    error("Error processing scan data for user:", userId, errMsg);
    throw err;
  }
}