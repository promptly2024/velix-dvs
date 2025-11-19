import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import axios from "axios";

interface SocialMediaAccount {
  platform: string;
  hasAccount: boolean;
  url?: string;
  username?: string;
}

interface ProfessionalInfo {
  currentCompany?: string;
  position?: string;
  location?: string;
  linkedinUrl?: string;
}

interface PersonalInfo {
  name?: string;
  phone?: string;
  address?: string;
  education?: string[];
}

interface WebPresenceData {
  email: string;
  socialMediaAccounts: SocialMediaAccount[];
  professionalInfo: ProfessionalInfo;
  personalInfo: PersonalInfo;
  otherOnlinePresence: string[];
}

export const scanWebPresenceWithPerplexity = async (
  req: Request,
  res: Response
) => {
  const userId = req.user?.userId;
  const { email } = req.body;

  if (!userId) return res.status(401).json({ error: "Unauthorized." });
  if (!email) return res.status(400).json({ error: "Email is required." });

  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    throw new Error("Perplexity API key is not configured.");
  }

  try {
    const initialPrompt = `give me all the details about this email "${email}" there all social media accounts, everything do a google web presence search also
    
. Find:

1. Professional Information:
   - Current company and position
   - Work location
   - LinkedIn profile
   - Professional background

2. Social Media Accounts:
   - LinkedIn, GitHub, Instagram, Facebook, Twitter/X, YouTube
   - Include profile URLs and usernames

3. Personal Information:
   - Full name
   - Phone number
   - Address/Location
   - Educational background

4. Other Online Presence:
   - Portfolio websites
   - Coding profiles (LeetCode, CodeChef, HackerRank, etc.)
   - Blogs or personal websites
   - Any other public profiles

Be thorough and search multiple sources. Only provide verified, factual information from public sources.`;

    const initialResponse = await axios.post(
      "https://api.perplexity.ai/chat/completions",
      {
        model: "sonar-pro",
        messages: [
          {
            role: "system",
            content:
              "You are a professional OSINT researcher. Provide detailed, accurate information from verified public sources. Be thorough and comprehensive.",
          },
          {
            role: "user",
            content: initialPrompt,
          },
        ],
        temperature: 0.2,
        return_citations: true,
        search_recency_filter: "month",
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        timeout: 60000,
      }
    );

    const comprehensiveInfo = initialResponse.data.choices[0].message.content;

    const schema = {
      type: "object",
      properties: {
        email: { type: "string" },
        socialMediaAccounts: {
          type: "array",
          items: {
            type: "object",
            properties: {
              platform: { type: "string" },
              hasAccount: { type: "boolean" },
              url: { type: "string" },
              username: { type: "string" },
            },
            required: ["platform", "hasAccount"],
          },
        },
        professionalInfo: {
          type: "object",
          properties: {
            currentCompany: { type: "string" },
            position: { type: "string" },
            location: { type: "string" },
            linkedinUrl: { type: "string" },
          },
        },
        personalInfo: {
          type: "object",
          properties: {
            name: { type: "string" },
            phone: { type: "string" },
            address: { type: "string" },
            education: {
              type: "array",
              items: { type: "string" },
            },
          },
        },
        otherOnlinePresence: {
          type: "array",
          items: { type: "string" },
        },
      },
      required: ["email", "socialMediaAccounts"],
    };

    const structuringPrompt = `Based on the following research about email "${email}", extract and structure the information into JSON format.

Research Data:
${comprehensiveInfo}

Extract:
1. Social media accounts - ONLY include platforms where an account was actually found (hasAccount: true). Do not include platforms with no account found.
2. Professional information (company, position, location, LinkedIn URL)
3. Personal information (name, phone, address, education)
4. Other online presence (websites, portfolios, coding profiles)

Only include verified information from the research. If information is not available, omit the field or use empty string.`;

    const structuredResponse = await axios.post(
      "https://api.perplexity.ai/chat/completions",
      {
        model: "sonar-pro",
        messages: [
          {
            role: "system",
            content:
              "You are a data extraction specialist. Extract and structure information accurately from the provided research. Only include verified data.",
          },
          {
            role: "user",
            content: structuringPrompt,
          },
        ],
        temperature: 0.1,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "web_presence_data",
            schema: schema,
            strict: true,
          },
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        timeout: 30000,
      }
    );

    const webPresenceData: WebPresenceData = JSON.parse(
      structuredResponse.data.choices[0].message.content
    );

    const allPlatforms = [
      "LinkedIn",
      "Instagram",
      "Facebook",
      "X/Twitter",
      "GitHub",
      "YouTube",
    ];

    const foundPlatforms = webPresenceData.socialMediaAccounts.map((acc) =>
      acc.platform.toLowerCase()
    );

    const completeSocialMedia = [
      ...webPresenceData.socialMediaAccounts,
      ...allPlatforms
        .filter(
          (platform) =>
            !foundPlatforms.some((found) =>
              found.includes(platform.toLowerCase().split("/")[0])
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
      message: "Web presence information retrieved.",
      data: {
        email: webPresenceData.email,
        socialMedia: completeSocialMedia,
        professional: webPresenceData.professionalInfo,
        personal: webPresenceData.personalInfo,
        otherPresence: webPresenceData.otherOnlinePresence,
        rawResearch: comprehensiveInfo,
      },
    });
  } catch (error: any) {
    console.error("Perplexity scan error:", error);

    if (axios.isAxiosError(error)) {
      return res.status(error.response?.status || 500).json({
        error: "Scan failed.",
        details: error.response?.data || error.message,
      });
    }

    return res.status(500).json({
      error: "Scan failed.",
      details: error.message,
    });
  }
};

export const getPerplexityScanHistory = async (
  req: Request,
  res: Response
) => {
  const userId = req.user?.userId;
  const { email } = req.query;

  if (!userId) return res.status(401).json({ error: "Unauthorized." });

  try {
    const where: any = { userId };
    if (email) where.email = email as string;

    // const history = await prisma.perplexityWebPresence.findMany({
    //   where,
    //   orderBy: { scanDate: "desc" },
    //   take: 10,
    // });

    return res.status(200).json({
      message: "Scan history retrieved.",
      data: history,
    });
  } catch (error: any) {
    console.error("History retrieval error:", error);
    return res.status(500).json({ error: "Failed to retrieve history." });
  }
};
