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
    const deletedCount = await prisma.userIngredientExposure.deleteMany({
      where: { userId }
    });
    log(`Deleted ${deletedCount.count} old exposures for fresh scan`);

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

    const seenExposures = new Set<string>();

    async function createExposureRecord(ingredientKey: string, opts: ExposureData) {
      const map = ingredientKeyMap.get(ingredientKey);
      if (!map) {
        warn(`No ThreatIngredient found (NOT SEEDED) for key: ${ingredientKey}`);
        return null;
      }

      const uniqueKey = `${ingredientKey}:${opts.value || 'null'}:${opts.source}`;
      
      if (seenExposures.has(uniqueKey)) {
        log(`Skipping duplicate exposure: ${uniqueKey}`);
        return null;
      }
      
      seenExposures.add(uniqueKey);
      
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
      
      log(`Created exposure id=${result.id} ingredient=${ingredientKey} source=${opts.source}`);
      return result;
    }

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
          evidenceSnippet: `pwnCount=${pw.pwnCount}; severity=${pw.severity}`,
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

      log("Perplexity Data:", JSON.stringify(perplexityData).substring(0, 100) + "...");
      
      if (perplexityData) {
        const mappedExposures = mapPerplexityResponse(perplexityData, "AI");
        const processed = await processMappedExposures(mappedExposures);
        createdExposures.push(...processed);
        log(`Processed ${processed.length} unique exposures from Perplexity`);
      }
    } catch (e) {
      warn("webPresencePerplexity parse error", e);
    }

    // Filter out null values
    const created = createdExposures.filter(Boolean);
    log(`Total unique exposures created: ${created.length}`);
    log(`Deduplication prevented ${seenExposures.size - created.length} duplicates`);

    // Load threat categories
    const threat = await prisma.threatCategory.findMany({
      include: { ingredients: true }
    });

    const assessmentToUpsert: Array<{
      threatId: string;
      score: number;
      matchedIngredients: string[];
    }> = [];

    // Get all user exposures (should be fresh now)
    const userExposures = await prisma.userIngredientExposure.findMany({
      where: { userId },
      include: { ingredient: true }
    });

    // Build matched keys set (now with unique keys only)
    const matchedKeysSet = new Set<string>();
    for (const ue of userExposures) {
      const ingRecord = allIngredients.find(ing => ing.id === ue.ingredientId);
      if (ingRecord) {
        matchedKeysSet.add(ingRecord.key);
      }
    }

    log(`Unique ingredient keys found: ${matchedKeysSet.size}`);
    log(`Ingredient keys: ${Array.from(matchedKeysSet).join(', ')}`);

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
    log(`Prepared ${assessmentToUpsert.length} threat assessments to upsert`);

    await prisma.threatAssessment.deleteMany({
      where: { userId }
    });
    log(`Deleted old threat assessments for fresh calculation`);

    // Upsert threat assessments
    for (const a of assessmentToUpsert) {
      await prisma.threatAssessment.create({
        data: {
          userId,
          threatId: a.threatId,
          score: a.score,
          matchedIngredients: a.matchedIngredients
        }
      });
      log(`Created threatAssessment threatId=${a.threatId} score=${a.score}`);
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

    log(`DVS Score: ${dvsScore}% (${ingredientFound}/${totalIngredient} ingredients)`);
    log("Scan data processing complete");

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
    error("Error processing scan data:", userId, errMsg);
    throw err;
  }
}