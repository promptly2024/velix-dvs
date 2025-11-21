import { ExposureSource } from "@prisma/client";

export interface ExposureData {
  value?: string | null;
  source: ExposureSource;
  evidenceUrl?: string | null;
  evidenceSnippet?: string | null;
  confidence?: number;
}

export interface MappedExposure {
  ingredientKey: string;
  exposureData: ExposureData;
}

const SOCIAL_MEDIA_PLATFORM_MAP: Record<string, string> = {
  linkedin: "linkedin_id",
  "linked in": "linkedin_id",
  facebook: "facebook_profile",
  fb: "facebook_profile",
  instagram: "instagram_profile",
  ig: "instagram_profile",
  insta: "instagram_profile",
  twitter: "twitter_profile",
  "x/twitter": "twitter_profile",
  x: "twitter_profile",
  github: "github_profile",
  git: "github_profile",
  youtube: "youtube_channel",
  yt: "youtube_channel",
  reddit: "reddit_id",
  snapchat: "snapchat_id",
  snap: "snapchat_id",
  telegram: "telegram_username",
  tg: "telegram_username",
  whatsapp: "whatsapp_number",
  wa: "whatsapp_number",
};

export function extractIdentifiersFromText(
  text: string | null | undefined,
  source: ExposureSource
): MappedExposure[] {
  if (!text) return [];

  const exposures: MappedExposure[] = [];
  const t = text as string;

  try {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emails: string[] = t.match(emailRegex) || [];
    emails.forEach((email) => {
      exposures.push({
        ingredientKey: "email_id",
        exposureData: {
          value: email.trim(),
          source,
          evidenceSnippet: t.substring(0, 200),
          confidence: 0.9,
        },
      });
    });

    // Phone: + and digits or 7-15 digit sequences
    const phoneRegex = /(?:\+?\d[\d\s\-()]{6,}\d)/g;
    const phones: string[] = t.match(phoneRegex) || [];
    phones.forEach((p) => {
      exposures.push({
        ingredientKey: "phone_number",
        exposureData: {
          value: p.trim(),
          source,
          evidenceSnippet: t.substring(0, 200),
          confidence: 0.85,
        },
      });
    });

    // PAN (India) pattern: 5 letters 4 digits 1 letter
    const panRegex = /\b[a-zA-Z]{5}\d{4}[a-zA-Z]\b/g;
    const pans: string[] = t.match(panRegex) || [];
    pans.forEach((p) => {
      exposures.push({
        ingredientKey: "pan_number",
        exposureData: {
          value: p.trim(),
          source,
          evidenceSnippet: t.substring(0, 200),
          confidence: 0.9,
        },
      });
    });

    // Aadhaar (12 digits)
    const aadhaarRegex = /\b\d{12}\b/g;
    const aadhaars: string[] = t.match(aadhaarRegex) || [];
    aadhaars.forEach((a) => {
      exposures.push({
        ingredientKey: "aadhaar_number",
        exposureData: {
          value: a.trim(),
          source,
          evidenceSnippet: t.substring(0, 200),
          confidence: 0.9,
        },
      });
    });

    // UPI id: something like name@bank
    const upiRegex = /[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}/g;
    const upis: string[] = t.match(upiRegex) || [];
    upis.forEach((u) => {
      // Filter out emails - now TypeScript knows both are string[]
      if (!emails.includes(u)) {
        exposures.push({
          ingredientKey: "upi_id",
          exposureData: {
            value: u.trim(),
            source,
            evidenceSnippet: t.substring(0, 200),
            confidence: 0.8,
          },
        });
      }
    });

    // Credit/Debit card (16 digits with optional spaces/dashes)
    const cardRegex = /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g;
    const cards: string[] = t.match(cardRegex) || [];
    cards.forEach((card) => {
      exposures.push({
        ingredientKey: "credit_card_number",
        exposureData: {
          value: card.trim(),
          source,
          evidenceSnippet: t.substring(0, 200),
          confidence: 0.75,
        },
      });
    });

    // Address patterns
    const addressRegex = /\b\d+[\w\s,.-]+(street|st|road|rd|avenue|ave|lane|ln|drive|dr|apartment|apt|floor|flat)\b/gi;
    const addresses: string[] = t.match(addressRegex) || [];
    addresses.forEach((addr) => {
      exposures.push({
        ingredientKey: "home_address",
        exposureData: {
          value: addr.trim(),
          source,
          evidenceSnippet: t.substring(0, 200),
          confidence: 0.65,
        },
      });
    });
  } catch (e) {
    console.warn("Identifier extraction error:", e);
  }

  return exposures;
}

export function fallbackPlatformToIngredient(platform?: string | null): string | undefined {
  if (!platform) return undefined;
  const key = platform.toLowerCase().replace(/\s+/g, "");
  return SOCIAL_MEDIA_PLATFORM_MAP[key];
}

// education information to ingredient key
export function mapEducationToIngredient(educationText: string): string {
  const text = educationText.toLowerCase();

  if (/college|university|institute|academy|polytechnic/i.test(text)) {
    return "college_name";
  } else if (/school|high school|secondary|primary/i.test(text)) {
    return "school_name";
  }

  return "web_mentions";
}


// function to map Perplexity web presence response to exposures
export function mapPerplexityResponse(
  perplexityData: any,
  source: ExposureSource = "AI"
): MappedExposure[] {
  console.log("\n\n[perplexityMapper] mapping Perplexity data:", JSON.stringify(perplexityData).substring(0, 50) + (JSON.stringify(perplexityData).length > 50 ? "..." : ""));
  const exposures: MappedExposure[] = [];

  try {
    const wp =
      perplexityData?.data?.data ??
      perplexityData?.data ??
      perplexityData;

    if (!wp || typeof wp !== "object") {
      return exposures;
    }

    // 1. Map Social Media Accounts
    const socialMedia = wp.socialMedia ?? wp.socialMediaAccounts ?? [];
    if (Array.isArray(socialMedia)) {
      socialMedia.forEach((account: any) => {
        if (!account || account.hasAccount !== true) return;

        const platform =
          account.platform ??
          account.platformName ??
          account.platform_type ??
          account.name ??
          "other";

        let ingredientKey = fallbackPlatformToIngredient(platform);
        if (!ingredientKey) {
          ingredientKey = "web_mentions";
        }

        exposures.push({
          ingredientKey,
          exposureData: {
            value:
              account.username ??
              account.url ??
              account.handle ??
              account.profileName ??
              null,
            source,
            evidenceUrl: account.url ?? null,
            evidenceSnippet: account.username ?? account.bio ?? null,
            confidence: 0.7,
          },
        });
      });
    }

    // 2. Map Professional Information
    const professional = wp.professional ?? wp.professionalInfo ?? {};
    if (professional && typeof professional === "object") {
      if (professional.linkedinUrl) {
        exposures.push({
          ingredientKey: "linkedin_id",
          exposureData: {
            value: professional.linkedinUrl,
            source,
            evidenceUrl: professional.linkedinUrl,
            confidence: 0.85,
          },
        });
      }

      if (professional.currentCompany) {
        exposures.push({
          ingredientKey: "company_name",
          exposureData: {
            value: professional.currentCompany,
            source,
            evidenceSnippet: professional.position ?? null,
            confidence: 0.7,
          },
        });
      }

      if (professional.position) {
        exposures.push({
          ingredientKey: "job_role_department",
          exposureData: {
            value: professional.position,
            source,
            confidence: 0.65,
          },
        });
      }

      if (professional.location) {
        exposures.push({
          ingredientKey: "work_location",
          exposureData: {
            value: professional.location,
            source,
            confidence: 0.6,
          },
        });
      }
    }

    // 3. Map Personal Information
    const personal = wp.personal ?? wp.personalInfo ?? {};
    if (personal && typeof personal === "object") {
      if (personal.name) {
        exposures.push({
          ingredientKey: "full_name",
          exposureData: {
            value: personal.name,
            source,
            confidence: 0.9,
          },
        });
      }

      if (personal.phone) {
        exposures.push({
          ingredientKey: "phone_number",
          exposureData: {
            value: personal.phone,
            source,
            confidence: 0.9,
          },
        });
      }

      if (personal.address) {
        exposures.push({
          ingredientKey: "home_address",
          exposureData: {
            value: personal.address,
            source,
            confidence: 0.8,
          },
        });
      }

      // Map education
      const education = personal.education ?? [];
      if (Array.isArray(education)) {
        education.forEach((edu: any) => {
          const eduStr = (edu || "").toString();
          if (!eduStr) return;

          const ingredientKey = mapEducationToIngredient(eduStr);
          exposures.push({
            ingredientKey,
            exposureData: {
              value: eduStr,
              source,
              confidence: 0.7,
            },
          });
        });
      }
    }

    // 4. Map Other Online Presence
    const otherPresence = wp.otherPresence ?? wp.otherOnlinePresence ?? [];
    if (Array.isArray(otherPresence)) {
      otherPresence.forEach((item: any) => {
        const value = typeof item === "string" ? item : item?.url ?? item?.name;
        if (value) {
          exposures.push({
            ingredientKey: "web_mentions",
            exposureData: {
              value,
              source,
              evidenceSnippet: value,
              confidence: 0.5,
            },
          });
        }
      });
    }

    // 5. Extract identifiers from raw research text
    if (typeof wp.rawResearch === "string") {
      const textExposures = extractIdentifiersFromText(wp.rawResearch, source);
      exposures.push(...textExposures);
    }

    // 6. Handle old format with findings array
    if (wp.data && Array.isArray(wp.data.findings)) {
      wp.data.findings.forEach((finding: any) => {
        exposures.push({
          ingredientKey: "web_mentions",
          exposureData: {
            value: finding.title ?? finding.url ?? null,
            source,
            evidenceUrl: finding.url ?? null,
            evidenceSnippet: finding.snippet ?? null,
            confidence: 0.5,
          },
        });

        // Extract identifiers from finding content
        const findingText =
          finding.snippet ?? finding.title ?? finding.url ?? null;
        if (findingText) {
          const textExposures = extractIdentifiersFromText(findingText, source);
          exposures.push(...textExposures);
        }
      });
    }

    // Log summary if any ingredients were found
    if (exposures.length > 0) {
      const ingredientCounts = exposures.reduce((acc: Record<string, number>, e) => {
        acc[e.ingredientKey] = (acc[e.ingredientKey] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      console.log("\n\n[perplexityMapper] found exposures:", {
        total: exposures.length,
        byIngredient: ingredientCounts,
      });
    }

    return exposures;
  } catch (error) {
    console.error("Error mapping Perplexity response:", error);
    return exposures;
  }
}
