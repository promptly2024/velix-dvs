/* eslint-disable */
import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { 
  calculateExposureLevel, 
  calculateWebPresenceRisk, 
} from "../utils/riskCalculator";
import { getAIClient } from "../config/geminiAiClient";
import { createResponseSchema } from "../helper/geminiResponseSchema";

interface WebPresenceData {
  email: string;
  socialMediaAccounts: Array<{
    platform: string;
    hasAccount: boolean;
    url: string;
    username: string;
    profileName?: string;
  }>;
  professionalInfo: {
    currentCompany?: string;
    position?: string;
    location?: string;
    linkedinUrl?: string;
  };
  personalInfo: {
    name?: string;
    phone?: string;
    address?: string;
    education?: string[];
  };
  otherOnlinePresence: string[];
}

export const scanWebPresence = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { email } = req.body;

  if (!userId) return res.status(401).json({ error: "Unauthorized." });
  if (!email) return res.status(400).json({ error: "Email is required." });

  try {
    const ai = getAIClient();

    const searchPrompt = `You MUST use Google Search to find real information about the email: "${email}"

Search the web thoroughly and provide detailed findings for:

1. Social Media Accounts - Search each platform:
   - LinkedIn: search "site:linkedin.com ${email}"
   - GitHub: search "site:github.com ${email}"
   - Instagram: search "${email.split('@')[0]}" instagram
   - Facebook: search "${email}" facebook
   - Twitter/X: search "${email}" OR "@${email.split('@')[0]}" twitter OR x.com
   - Portfolio: search "${email}"
   
   For each FOUND profile, provide:
   - Platform name
   - Profile URL
   - Username
   - Display name/profile name
   - Mark if account exists

2. Professional Information:
   - Search "${email} company" OR "${email} linkedin work"
   - Current company and position
   - Work location
   - LinkedIn profile URL

3. Personal Information (public only):
   - Search "${email} name"
   - Full name
   - Phone (if publicly available)
   - Location (if public)
   - Education: search "${email} university" OR "${email} college"

4. Other Online Presence:
   - Search "${email.split('@')[0]} portfolio" OR "website" OR "blog"
   - Coding profiles: LeetCode, HackerRank, CodeChef, GeeksforGeeks, Codeforces
   - Personal websites or portfolios

IMPORTANT:
- Use Google Search for ALL information
- Only report what you ACTUALLY FIND through searches
- Provide real URLs from search results
- If you don't find a profile, clearly state "Not found"
- Format your findings clearly for each category`;

    const groundingTool = {
      googleSearch: {},
    };

    const searchResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: searchPrompt,
      config: {
        tools: [groundingTool],
      },
    });

    const searchResults = searchResponse.text ?? "";

    const rawSearchResponse = searchResponse as any;
    const groundingMetadata = rawSearchResponse.groundingMetadata;
    const searchEntryPoint = groundingMetadata?.searchEntryPoint;
    const groundingSupports = groundingMetadata?.groundingSupports || [];
    const webSearchQueries = groundingMetadata?.webSearchQueries || [];

    const structurePrompt = `Based on the following web search results about "${email}", extract and structure the information into valid JSON format.

Search Results:
${searchResults}

Extract the information into this exact JSON structure:
{
  "email": "${email}",
  "socialMediaAccounts": [
    {
      "platform": "Platform Name",
      "hasAccount": true/false,
      "url": "profile URL if found",
      "username": "username if found",
      "profileName": "display name if found"
    }
  ],
  "professionalInfo": {
    "currentCompany": "company name or null",
    "position": "job title or null",
    "location": "location or null",
    "linkedinUrl": "linkedin URL or null"
  },
  "personalInfo": {
    "name": "full name or null",
    "phone": "phone or null",
    "address": "address or null",
    "education": ["school1", "school2"] or null
  },
  "otherOnlinePresence": ["url1", "url2"]
}

Rules:
- ONLY include platforms where hasAccount is true if you found a real profile in the search results
- For platforms not found, set hasAccount: false, url: "", username: ""
- Use null for missing professional/personal info
- Only include URLs you found in the search results
- Extract ALL coding profiles, portfolios, and other online presence URLs`;

    const responseSchema = createResponseSchema();

    const structureResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: structurePrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const responseText = structureResponse.text ?? "{}";
    const webPresenceData: WebPresenceData = JSON.parse(responseText);

    const findings: any[] = [];

    const platformTypeMap: Record<string, string> = {
      linkedin: "PROFESSIONAL",
      github: "PROFESSIONAL",
      instagram: "SOCIAL_MEDIA",
      facebook: "SOCIAL_MEDIA",
      twitter: "SOCIAL_MEDIA",
      x: "SOCIAL_MEDIA",
      geeksforgeeks: "PROFESSIONAL",
      leetcode: "PROFESSIONAL",
    };

    for (const account of webPresenceData.socialMediaAccounts) {
      if (account.hasAccount && account.url) {
        const platformKey = account.platform
          .toLowerCase()
          .replace(/\//g, "")
          .split(" ")[0];
        const platformType = platformTypeMap[platformKey] || "OTHER";

        const finding = {
          platform: account.platform,
          platformType: platformType,
          url: account.url,
          snippet: account.profileName
            ? `${account.platform} profile: ${account.profileName}`
            : `${account.platform} profile found`,
          profileName: account.profileName || account.username,
          // exposureLevel: calculateExposureLevel(platformType),
          evidenceSource: "Google Search",
          evidenceUrl: account.url,
          evidenceSnippet: account.profileName || null,
        };

        findings.push(finding);
      }
    }

    for (const presenceUrl of webPresenceData.otherOnlinePresence || []) {
      if (presenceUrl && presenceUrl.startsWith("http")) {
        const finding = {
          platform: "Other",
          platformType: "OTHER",
          url: presenceUrl,
          snippet: "Online presence detected",
          exposureLevel: "MEDIUM",
          evidenceSource: "Google Search",
          evidenceUrl: presenceUrl,
          evidenceSnippet: null,
        };

        findings.push(finding);
      }
    }

    const riskScore = calculateWebPresenceRisk(findings);

    const allPlatforms = [
      "LinkedIn",
      "GitHub",
      "Instagram",
      "Facebook",
      "X/Twitter",
      "YouTube",
      "TikTok",
      "Reddit",
      "Medium",
    ];

    const foundPlatforms = webPresenceData.socialMediaAccounts
      .filter((acc) => acc.hasAccount)
      .map((acc) => acc.platform.toLowerCase());

    const completeSocialMedia = [
      ...webPresenceData.socialMediaAccounts.filter((acc) => acc.hasAccount),
      ...allPlatforms
        .filter(
          (platform) =>
            !foundPlatforms.some((found) =>
              platform.toLowerCase().includes(found.split("/")[0])
            )
        )
        .map((platform) => ({
          platform,
          hasAccount: false,
          url: "",
          username: "",
        })),
    ];

    // create a database call here 

    return res.status(200).json({
      message: "Web presence scan completed with Google Search grounding.",
      data: {
        email: webPresenceData.email,
        totalFindings: findings.length,
        riskScore,
        socialMedia: completeSocialMedia,
        professional: webPresenceData.professionalInfo,
        personal: webPresenceData.personalInfo,
        otherPresence: webPresenceData.otherOnlinePresence,
        findings: findings.map((f) => ({
          platform: f.platform,
          platformType: f.platformType,
          url: f.url,
          exposureLevel: f.exposureLevel,
          profileName: f.profileName,
          evidenceSource: f.evidenceSource,
        })),
        grounding: {
          searchEntryPoint: searchEntryPoint?.renderedContent || null,
          queriesUsed: webSearchQueries,
          totalSources: groundingSupports.length,
        },
      },
    });
  } catch (error: any) {
    console.error("Web presence scan error:", error);
    return res.status(500).json({
      error: "Scan failed.",
      details: error.message,
    });
  }
};

export const analyzeDigitalFootprint = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { email } = req.body;

  if (!userId) return res.status(401).json({ error: "Unauthorized." });
  if (!email) return res.status(400).json({ error: "Email is required." });

  try {
    const ai = getAIClient();

    const webPresence = await prisma.webPresence.findFirst({
      where: { userId, email },
      include: { findings: true },
      orderBy: { scanDate: "desc" },
    });

    if (!webPresence) {
      return res.status(404).json({
        error: "No web presence data found. Please run a scan first.",
      });
    }

    const breachData = await prisma.breachCheck.findMany({
      where: { userId, email },
      include: { breachRecords: true },
    });

    const totalBreaches = breachData.reduce(
      (sum, check) => sum + check.breachesFound,
      0
    );

    const socialMediaCount = webPresence.findings.filter(
      (f) => f.platformType === "SOCIAL_MEDIA"
    ).length;

    const professionalCount = webPresence.findings.filter(
      (f) => f.platformType === "PROFESSIONAL"
    ).length;

    const forumCount = webPresence.findings.filter(
      (f) => f.platformType === "FORUM"
    ).length;

    const blogCount = webPresence.findings.filter(
      (f) => f.platformType === "BLOG"
    ).length;

    const otherCount = webPresence.findings.filter(
      (f) => f.platformType === "OTHER"
    ).length;

    const webPresenceRisk = webPresence.riskScore;
    const breachRisk = Math.min(100, totalBreaches * 15);
    const exposureRisk = Math.min(
      100,
      socialMediaCount * 8 +
        professionalCount * 5 +
        forumCount * 10 +
        blogCount * 6
    );

    const overallRiskScore = Math.round(
      webPresenceRisk * 0.4 + breachRisk * 0.4 + exposureRisk * 0.2
    );

    const analysisPrompt = `Analyze the digital footprint risk for this profile:

    Email: ${email}
    Total Online Presence: ${webPresence.totalFindings} platforms
    Social Media Accounts: ${socialMediaCount}
    Professional Platforms: ${professionalCount}
    Forums: ${forumCount}
    Blogs: ${blogCount}
    Data Breaches Found: ${totalBreaches}

    Platforms found: ${webPresence.findings.map((f) => f.platform).join(", ")}

    Provide a comprehensive risk assessment and 3-5 specific, actionable recommendations to reduce digital exposure.`;

    const groundingTool = {
      googleSearch: {},
    };

    const analysisResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: analysisPrompt,
      config: {
        tools: [groundingTool],
      },
    });

    const analysisText = analysisResponse.text ?? "";

    const structurePrompt = `Based on the following risk analysis, extract and structure into JSON:

    Analysis:
    ${analysisText}

    Extract into this JSON structure:
    {
      "riskAssessment": "brief risk assessment summary",
      "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
    }`;

    const analysisSchema = {
      type: "object",
      properties: {
        riskAssessment: {
          type: "string",
          description: "Brief risk assessment summary",
        },
        recommendations: {
          type: "array",
          items: {
            type: "string",
          },
          description: "3-5 actionable recommendations",
        },
      },
      required: ["riskAssessment", "recommendations"],
    };

    const structureResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: structurePrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
      },
    });

    const structuredText = structureResponse.text ?? "{}";
    const aiAnalysis = JSON.parse(structuredText);

    const footprint = await prisma.digitalFootprint.upsert({
      where: {
        userId_email: {
          userId,
          email,
        },
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
      },
    });

    return res.status(200).json({
      message: "Digital footprint analysis completed with AI insights.",
      data: {
        footprint: {
          id: footprint.id,
          email: email,
          totalExposure: webPresence.totalFindings,
          socialMediaCount: socialMediaCount,
          professionalCount: professionalCount,
          dataBreachCount: totalBreaches,
          overallRiskScore: overallRiskScore,
          lastScanned: new Date(),
        },
        breakdown: {
          webPresenceRisk,
          breachRisk,
          exposureRisk,
          platformDistribution: {
            socialMedia: socialMediaCount,
            professional: professionalCount,
            forums: forumCount,
            blogs: blogCount,
            other: otherCount,
          },
        },
        aiInsights: {
          assessment: aiAnalysis.riskAssessment,
          recommendations: aiAnalysis.recommendations,
        },
        riskLevel:
          overallRiskScore >= 70
            ? "HIGH"
            : overallRiskScore >= 40
            ? "MEDIUM"
            : "LOW",
      },
    });
  } catch (error: any) {
    console.error("Digital footprint analysis error:", error);
    return res.status(500).json({
      error: "Analysis failed.",
      details: error.message,
    });
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
  } catch (error: any) {
    console.error('Report generation error:', error);
    return res.status(500).json({ error: "Failed to generate report." });
  }
};
