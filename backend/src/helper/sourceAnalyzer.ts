import { prisma } from "../lib/prisma";

interface SourceDistribution {
  source: string;
  userIngredientsCount: number;
  totalSystemIngredientsCount: number;
  percentage: number;
}

interface SourceDistributionResult {
  distributions: SourceDistribution[];
  summary: {
    totalUserExposures: number;
    totalUniqueIngredients: number;
    breakdown: string;
  };
}

export async function calculateSourceDistribution(
  userId: string
): Promise<SourceDistributionResult> {

  const allSystemIngredients = await prisma.threatIngredient.findMany({
    select: {
      id: true,
      key: true,
      detectionSources: true
    }
  });

  const systemSourceCounts = new Map<string, number>();

  for (const ingredient of allSystemIngredients) {
    for (const source of ingredient.detectionSources) {
      const sourceStr = String(source); // Convert to string
      systemSourceCounts.set(
        sourceStr,
        (systemSourceCounts.get(sourceStr) || 0) + 1
      );
    }
  }

  for (const [source, count] of systemSourceCounts.entries()) {
    console.log(`  - ${source}: ${count} ingredients`);
  }

  const userExposures = await prisma.userIngredientExposure.findMany({
    where: { userId },
    include: {
      ingredient: {
        select: {
          id: true,
          key: true,
          detectionSources: true
        }
      }
    }
  });

  const userSourceCounts = new Map<string, number>();

  for (const exposure of userExposures) {
    for (const source of exposure.ingredient.detectionSources) {
      const sourceStr = String(source);
      userSourceCounts.set(
        sourceStr,
        (userSourceCounts.get(sourceStr) || 0) + 1
      );
    }
  }

  const distributions: SourceDistribution[] = [];

  for (const [source, totalInSystem] of systemSourceCounts.entries()) {
    const userCount = userSourceCounts.get(source) || 0;

    const percentage = totalInSystem > 0 
      ? Math.round((userCount / totalInSystem) * 10000) / 100
      : 0;

    distributions.push({
      source,
      userIngredientsCount: userCount,
      totalSystemIngredientsCount: totalInSystem,
      percentage
    });
  }

  distributions.sort((a, b) => a.source.localeCompare(b.source));

  const breakdown = distributions
    .map(d => `${d.source}=${d.userIngredientsCount}/${d.totalSystemIngredientsCount} (${d.percentage}%)`)
    .join(", ");

  return {
    distributions,
    summary: {
      totalUserExposures: userExposures.length,
      totalUniqueIngredients: allSystemIngredients.length,
      breakdown
    }
  };
}

export async function calculateSourceDistributionWithMapping(
  userId: string
): Promise<SourceDistributionResult> {

  const sourceMapping: Record<string, string> = {
    'BREACH': 'Breach Database',
    'WEB_SEARCH': 'Web Search',
    'DARK_WEB': 'Dark Web',
    'SOCIAL_SEARCH': 'Social Media',
    'AI_PROMPT': 'AI Detection'
  };

  const allSystemIngredients = await prisma.threatIngredient.findMany({
    select: {
      id: true,
      key: true,
      detectionSources: true
    }
  });

  const systemSourceCounts = new Map<string, number>();

  for (const ingredient of allSystemIngredients) {
    for (const source of ingredient.detectionSources) {
      const sourceStr = String(source);
      systemSourceCounts.set(
        sourceStr,
        (systemSourceCounts.get(sourceStr) || 0) + 1
      );
    }
  }

  const userExposures = await prisma.userIngredientExposure.findMany({
    where: { userId },
    include: {
      ingredient: {
        select: {
          id: true,
          key: true,
          detectionSources: true
        }
      }
    }
  });

  const userSourceCounts = new Map<string, number>();

  for (const exposure of userExposures) {
    for (const source of exposure.ingredient.detectionSources) {
      const sourceStr = String(source);
      userSourceCounts.set(
        sourceStr,
        (userSourceCounts.get(sourceStr) || 0) + 1
      );
    }
  }

  const distributions: SourceDistribution[] = [];

  for (const [source, totalInSystem] of systemSourceCounts.entries()) {
    const userCount = userSourceCounts.get(source) || 0;
    const percentage = totalInSystem > 0 
      ? Math.round((userCount / totalInSystem) * 10000) / 100
      : 0;

    distributions.push({
      source: sourceMapping[source] || source,
      userIngredientsCount: userCount,
      totalSystemIngredientsCount: totalInSystem,
      percentage
    });
  }

  distributions.sort((a, b) => a.source.localeCompare(b.source));

  const breakdown = distributions
    .map(d => `${d.source}=${d.userIngredientsCount}/${d.totalSystemIngredientsCount} (${d.percentage}%)`)
    .join(", ");

  return {
    distributions,
    summary: {
      totalUserExposures: userExposures.length,
      totalUniqueIngredients: allSystemIngredients.length,
      breakdown
    }
  };
}

export function formatSourceDistributionLog(result: SourceDistributionResult): string {
  const percentLog = result.distributions
    .map(d => `${d.source}=${d.percentage}%`)
    .join(", ");

  const detailedLog = result.distributions
    .map(d => `${d.source}: ${d.userIngredientsCount}/${d.totalSystemIngredientsCount} ingredients (${d.percentage}% exposed)`)
    .join("\n  ");

  return `Source Distribution Percentages: ${percentLog}\n  ${detailedLog}\n  Total unique ingredients in system: ${result.summary.totalUniqueIngredients}`;
}