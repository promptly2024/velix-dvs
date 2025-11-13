/* eslint-disable */
import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { 
  searchEmailOnPlatform, 
  extractProfileName, 
  delay 
} from "../utils/googleSearchUtils";
import { 
  calculateExposureLevel, 
  calculateWebPresenceRisk, 
  calculateOverallRiskScore
} from "../utils/riskCalculator";

interface PlatformConfig {
  domain: string;
  type: 'SOCIAL_MEDIA' | 'PROFESSIONAL' | 'FORUM' | 'BLOG' | 'GAMING' | 'OTHER';
  name: string;
}

const PLATFORMS: PlatformConfig[] = [
  { domain: 'instagram.com', type: 'SOCIAL_MEDIA', name: 'Instagram' },
  { domain: 'facebook.com', type: 'SOCIAL_MEDIA', name: 'Facebook' },
  { domain: 'twitter.com', type: 'SOCIAL_MEDIA', name: 'Twitter' },
  { domain: 'x.com', type: 'SOCIAL_MEDIA', name: 'X' },
  { domain: 'linkedin.com', type: 'PROFESSIONAL', name: 'LinkedIn' },
  { domain: 'github.com', type: 'PROFESSIONAL', name: 'GitHub' },
  { domain: 'reddit.com', type: 'FORUM', name: 'Reddit' },
  { domain: 'medium.com', type: 'BLOG', name: 'Medium' },
  { domain: 'pinterest.com', type: 'SOCIAL_MEDIA', name: 'Pinterest' },
  { domain: 'tiktok.com', type: 'SOCIAL_MEDIA', name: 'TikTok' },
  { domain: 'snapchat.com', type: 'SOCIAL_MEDIA', name: 'Snapchat' },
  { domain: 'youtube.com', type: 'SOCIAL_MEDIA', name: 'YouTube' },
  { domain: 'twitch.tv', type: 'GAMING', name: 'Twitch' },
  { domain: 'discord.com', type: 'GAMING', name: 'Discord' },
];

export const scanWebPresence = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { email } = req.body;

  if (!userId) return res.status(401).json({ error: "Unauthorized." });
  if (!email) return res.status(400).json({ error: "Email is required." });

  try {
    // web presence record
    const webPresence = await prisma.webPresence.create({
      data: {
        userId,
        email,
        totalFindings: 0,
        riskScore: 0,
      }
    });

    const findings: any[] = [];

    // Scan each platform
    for (const platform of PLATFORMS) {
      try {
        const results = await searchEmailOnPlatform(email, platform.domain);

        if (results.items && results.items.length > 0) {
          for (const item of results.items) {
            const finding = await prisma.webPresenceFinding.create({
              data: {
                webPresenceId: webPresence.id,
                platform: platform.name,
                platformType: platform.type,
                url: item.link,
                snippet: item.snippet,
                profileName: extractProfileName(item.link),
                exposureLevel: calculateExposureLevel(platform.type),
              }
            });
            findings.push(finding);
          }
        }

        await delay(1000);
      } catch (error) {
        console.error(`Error scanning ${platform.name}:`, error);
      }
    }

    const riskScore = calculateWebPresenceRisk(findings);

    await prisma.webPresence.update({
      where: { id: webPresence.id },
      data: {
        totalFindings: findings.length,
        riskScore,
      }
    });

    return res.status(200).json({
      message: "Web presence scan completed.",
      data: {
        webPresenceId: webPresence.id,
        email,
        totalFindings: findings.length,
        riskScore,
        findings: findings.map(f => ({
          platform: f.platform,
          platformType: f.platformType,
          url: f.url,
          exposureLevel: f.exposureLevel,
          profileName: f.profileName
        }))
      }
    });
  } catch (error: any) {
    console.error('Web presence scan error:', error);
    return res.status(500).json({ error: "Scan failed." });
  }
};

export const analyzeDigitalFootprint = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { email } = req.body;

  if (!userId) return res.status(401).json({ error: "Unauthorized." });
  if (!email) return res.status(400).json({ error: "Email is required." });

  try {
    const webPresence = await prisma.webPresence.findFirst({
      where: { userId, email },
      include: { findings: true },
      orderBy: { scanDate: 'desc' }
    });

    if (!webPresence) {
      return res.status(404).json({ 
        error: "No web presence data found. Please run a scan first." 
      });
    }

    const breachData = await prisma.breachCheck.findMany({
      where: { userId, email },
      include: { breachRecords: true }
    });

    const totalBreaches = breachData.reduce((sum, check) => sum + check.breachesFound, 0);

    const socialMediaCount = webPresence.findings.filter(
      f => f.platformType === 'SOCIAL_MEDIA'
    ).length;

    const professionalCount = webPresence.findings.filter(
      f => f.platformType === 'PROFESSIONAL'
    ).length;

    const overallRiskScore = calculateOverallRiskScore(
      webPresence.riskScore,
      totalBreaches,
      socialMediaCount
    );

    const footprint = await prisma.digitalFootprint.upsert({
      where: {
        userId_email: {
          userId,
          email
        }
      },
      update: {
        totalExposure: webPresence.totalFindings,
        socialMediaCount,
        professionalCount,
        dataBreachCount: totalBreaches,
        overallRiskScore,
        lastScanned: new Date(),
      },
      create: {
        userId,
        email,
        totalExposure: webPresence.totalFindings,
        socialMediaCount,
        professionalCount,
        dataBreachCount: totalBreaches,
        overallRiskScore,
      }
    });

    return res.status(200).json({
      message: "Digital footprint analysis completed.",
      data: {
        footprint: {
          id: footprint.id,
          email: footprint.email,
          totalExposure: footprint.totalExposure,
          socialMediaCount: footprint.socialMediaCount,
          professionalCount: footprint.professionalCount,
          dataBreachCount: footprint.dataBreachCount,
          overallRiskScore: footprint.overallRiskScore,
          lastScanned: footprint.lastScanned,
        },
        webPresence: {
          totalFindings: webPresence.totalFindings,
          riskScore: webPresence.riskScore,
          scanDate: webPresence.scanDate,
        },
        breaches: {
          totalBreaches,
          checks: breachData.length
        }
      }
    });
  } catch (error: any) {
    console.error('Digital footprint analysis error:', error);
    return res.status(500).json({ error: "Analysis failed." });
  }
};

export const getRiskAssessment = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { email } = req.query;

  if (!userId) return res.status(401).json({ error: "Unauthorized." });
  if (!email) return res.status(400).json({ error: "Email is required." });

  try {
    const footprint = await prisma.digitalFootprint.findFirst({
      where: { userId, email: email as string },
      orderBy: { lastScanned: 'desc' }
    });

    if (!footprint) {
      return res.status(404).json({ error: "No footprint data found." });
    }

    const riskBreakdown = {
      overall: footprint.overallRiskScore,
      riskLevel: footprint.overallRiskScore >= 70 ? 'HIGH' : 
                 footprint.overallRiskScore >= 40 ? 'MEDIUM' : 'LOW',
      categories: {
        webPresence: {
          count: footprint.totalExposure,
          score: Math.min(100, footprint.totalExposure * 5)
        },
        socialMedia: {
          count: footprint.socialMediaCount,
          score: Math.min(100, footprint.socialMediaCount * 10)
        },
        professional: {
          count: footprint.professionalCount,
          score: Math.min(100, footprint.professionalCount * 5)
        },
        dataBreaches: {
          count: footprint.dataBreachCount,
          score: Math.min(100, footprint.dataBreachCount * 15)
        },
      },
      lastScanned: footprint.lastScanned,
    };

    return res.status(200).json({
      message: "Risk assessment retrieved.",
      data: riskBreakdown
    });
  } catch (error: any) {
    console.error('Risk assessment error:', error);
    return res.status(500).json({ error: "Failed to retrieve risk assessment." });
  }
};

export const getWebPresenceHistory = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { email } = req.query;

  if (!userId) return res.status(401).json({ error: "Unauthorized." });

  try {
    const where: any = { userId };
    if (email) where.email = email as string;

    const history = await prisma.webPresence.findMany({
      where,
      include: {
        findings: {
          select: {
            platform: true,
            platformType: true,
            url: true,
            exposureLevel: true,
            profileName: true,
            detectedAt: true,
          }
        }
      },
      orderBy: { scanDate: 'desc' },
      take: 10
    });

    return res.status(200).json({
      message: "Web presence history retrieved.",
      data: history
    });
  } catch (error: any) {
    console.error('History retrieval error:', error);
    return res.status(500).json({ error: "Failed to retrieve history." });
  }
};

export const getDetailedReport = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { scanId } = req.params;

  if (!userId) return res.status(401).json({ error: "Unauthorized." });

  try {
    const webPresence = await prisma.webPresence.findFirst({
      where: { id: scanId, userId },
      include: {
        findings: true,
        user: {
          select: {
            email: true,
            username: true,
          }
        }
      }
    });

    if (!webPresence) {
      return res.status(404).json({ error: "Scan not found." });
    }

    // Group findings by platform type
    const findingsByType = webPresence.findings.reduce((acc: any, finding) => {
      if (!acc[finding.platformType]) {
        acc[finding.platformType] = [];
      }
      acc[finding.platformType].push(finding);
      return acc;
    }, {});

    const report = {
      scanId: webPresence.id,
      email: webPresence.email,
      scanDate: webPresence.scanDate,
      totalFindings: webPresence.totalFindings,
      riskScore: webPresence.riskScore,
      summary: {
        highExposure: webPresence.findings.filter(f => f.exposureLevel === 'HIGH').length,
        mediumExposure: webPresence.findings.filter(f => f.exposureLevel === 'MEDIUM').length,
        lowExposure: webPresence.findings.filter(f => f.exposureLevel === 'LOW').length,
      },
      findingsByType,
      allFindings: webPresence.findings
    };

    return res.status(200).json({
      message: "Detailed report generated.",
      data: report
    });
  } catch (error: any) {
    console.error('Report generation error:', error);
    return res.status(500).json({ error: "Failed to generate report." });
  }
};
