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

// Validation helpers
function isValidEmail(text: string): boolean {
  if (!text || text.length > 320) return false;
  const parts = text.split('@');
  if (parts.length !== 2) return false;
  const [local, domain] = parts;
  if (!local || !domain) return false;
  if (domain.indexOf('.') === -1) return false;
  return true;
}

function isValidPhone(text: string): boolean {
  const cleaned = text.replace(/[\s\-()]/g, '');
  if (cleaned.length < 7 || cleaned.length > 15) return false;
  const hasEnoughDigits = (cleaned.match(/\d/g) || []).length >= 7;
  return hasEnoughDigits;
}

function isValidPAN(text: string): boolean {
  if (text.length !== 10) return false;
  const letters = text.substring(0, 5) + text.substring(9);
  const digits = text.substring(5, 9);
  return /^[A-Z]+$/.test(letters) && /^\d+$/.test(digits);
}

function isValidAadhaar(text: string): boolean {
  return text.length === 12 && /^\d{12}$/.test(text);
}

function isValidCard(text: string): boolean {
  const cleaned = text.replace(/[\s\-]/g, '');
  if (cleaned.length !== 16) return false;
  return /^\d{16}$/.test(cleaned);
}

// Extract and deduplicate identifiers
export function extractIdentifiersFromText(
  text: string | null | undefined,
  source: ExposureSource
): MappedExposure[] {
  if (!text) return [];

  const exposures: MappedExposure[] = [];
  const seen = new Set<string>(); 

  try {
    // Extract emails
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emailMatches = text.match(emailRegex) || [];
    
    for (const email of emailMatches) {
      const normalized = email.trim().toLowerCase();
      const key = `email:${normalized}`;
      
      if (!seen.has(key) && isValidEmail(normalized)) {
        seen.add(key);
        exposures.push({
          ingredientKey: "email_id",
          exposureData: {
            value: normalized,
            source,
            evidenceSnippet: text.substring(0, 200),
            confidence: 0.9,
          },
        });
      }
    }

    // Extract phones
    const phoneRegex = /(?:\+?\d[\d\s\-()]{6,}\d)/g;
    const phoneMatches = text.match(phoneRegex) || [];
    
    for (const phone of phoneMatches) {
      const normalized = phone.trim();
      const key = `phone:${normalized}`;
      
      if (!seen.has(key) && isValidPhone(normalized)) {
        seen.add(key);
        exposures.push({
          ingredientKey: "phone_number",
          exposureData: {
            value: normalized,
            source,
            evidenceSnippet: text.substring(0, 200),
            confidence: 0.85,
          },
        });
      }
    }

    // Extract PAN
    const panRegex = /\b[a-zA-Z]{5}\d{4}[a-zA-Z]\b/g;
    const panMatches = text.match(panRegex) || [];
    
    for (const pan of panMatches) {
      const normalized = pan.trim().toUpperCase();
      const key = `pan:${normalized}`;
      
      if (!seen.has(key) && isValidPAN(normalized)) {
        seen.add(key);
        exposures.push({
          ingredientKey: "pan_number",
          exposureData: {
            value: normalized,
            source,
            evidenceSnippet: text.substring(0, 200),
            confidence: 0.9,
          },
        });
      }
    }

    // Extract Aadhaar
    const aadhaarRegex = /\b\d{12}\b/g;
    const aadhaarMatches = text.match(aadhaarRegex) || [];
    
    for (const aadhaar of aadhaarMatches) {
      const normalized = aadhaar.trim();
      const key = `aadhaar:${normalized}`;
      
      if (!seen.has(key) && isValidAadhaar(normalized)) {
        seen.add(key);
        exposures.push({
          ingredientKey: "aadhaar_number",
          exposureData: {
            value: normalized,
            source,
            evidenceSnippet: text.substring(0, 200),
            confidence: 0.9,
          },
        });
      }
    }

    // Extract credit/debit cards
    const cardRegex = /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g;
    const cardMatches = text.match(cardRegex) || [];
    
    for (const card of cardMatches) {
      const normalized = card.trim();
      const key = `card:${normalized}`;
      
      if (!seen.has(key) && isValidCard(normalized)) {
        seen.add(key);
        exposures.push({
          ingredientKey: "credit_card_number",
          exposureData: {
            value: normalized,
            source,
            evidenceSnippet: text.substring(0, 200),
            confidence: 0.75,
          },
        });
      }
    }

    // Extract addresses (only if unique and valid)
    const addressRegex = /\b\d+[\w\s,.-]+(street|st|road|rd|avenue|ave|lane|ln|drive|dr|apartment|apt|floor|flat)\b/gi;
    const addressMatches = text.match(addressRegex) || [];
    
    for (const addr of addressMatches) {
      const normalized = addr.trim();
      const key = `address:${normalized.toLowerCase()}`;
      
      if (!seen.has(key) && normalized.length > 10) {
        seen.add(key);
        exposures.push({
          ingredientKey: "home_address",
          exposureData: {
            value: normalized,
            source,
            evidenceSnippet: text.substring(0, 200),
            confidence: 0.65,
          },
        });
      }
    }

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

export function mapEducationToIngredient(educationText: string): string {
  const text = educationText.toLowerCase();

  if (/college|university|institute|academy|polytechnic/i.test(text)) {
    return "college_name";
  } else if (/school|high school|secondary|primary/i.test(text)) {
    return "school_name";
  }

  return "web_mentions";
}

export function mapPerplexityResponse(
  perplexityData: any,
  source: ExposureSource = "AI"
): MappedExposure[] {
  console.log("[perplexityMapper] Mapping Perplexity data");
  const exposures: MappedExposure[] = [];
  const seen = new Set<string>();

  try {
    const wp = perplexityData?.data?.data ?? perplexityData?.data ?? perplexityData;

    if (!wp || typeof wp !== "object") {
      return exposures;
    }

    // Helper to add unique exposure
    const addExposure = (key: string, exposure: MappedExposure) => {
      const uniqueKey = `${exposure.ingredientKey}:${exposure.exposureData.value}`;
      if (!seen.has(uniqueKey)) {
        seen.add(uniqueKey);
        exposures.push(exposure);
      }
    };

    // 1. Map Social Media
    const socialMedia = wp.socialMedia ?? wp.socialMediaAccounts ?? [];
    if (Array.isArray(socialMedia)) {
      socialMedia.forEach((account: any) => {
        if (!account || account.hasAccount !== true) return;

        const platform = account.platform ?? account.platformName ?? "other";
        let ingredientKey = fallbackPlatformToIngredient(platform);
        if (!ingredientKey) {
          ingredientKey = "web_mentions";
        }

        const value = account.username ?? account.url ?? account.profileName ?? null;
        if (value) {
          addExposure(`social:${platform}`, {
            ingredientKey,
            exposureData: {
              value,
              source,
              evidenceUrl: account.url ?? null,
              evidenceSnippet: account.username ?? account.bio ?? null,
              confidence: 0.7,
            },
          });
        }
      });
    }

    // 2. Map Professional Info
    const professional = wp.professional ?? wp.professionalInfo ?? {};
    if (professional && typeof professional === "object") {
      if (professional.linkedinUrl) {
        addExposure("prof:linkedin", {
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
        addExposure("prof:company", {
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
        addExposure("prof:position", {
          ingredientKey: "job_role_department",
          exposureData: {
            value: professional.position,
            source,
            confidence: 0.65,
          },
        });
      }

      if (professional.location) {
        addExposure("prof:location", {
          ingredientKey: "work_location",
          exposureData: {
            value: professional.location,
            source,
            confidence: 0.6,
          },
        });
      }
    }

    // 3. Map Personal Info
    const personal = wp.personal ?? wp.personalInfo ?? {};
    if (personal && typeof personal === "object") {
      if (personal.name) {
        addExposure("personal:name", {
          ingredientKey: "full_name",
          exposureData: {
            value: personal.name,
            source,
            confidence: 0.9,
          },
        });
      }

      if (personal.phone) {
        addExposure("personal:phone", {
          ingredientKey: "phone_number",
          exposureData: {
            value: personal.phone,
            source,
            confidence: 0.9,
          },
        });
      }

      if (personal.address) {
        addExposure("personal:address", {
          ingredientKey: "home_address",
          exposureData: {
            value: personal.address,
            source,
            confidence: 0.8,
          },
        });
      }

      const education = personal.education ?? [];
      if (Array.isArray(education)) {
        education.forEach((edu: any, idx: number) => {
          const eduStr = (edu || "").toString();
          if (!eduStr) return;

          const ingredientKey = mapEducationToIngredient(eduStr);
          addExposure(`edu:${idx}`, {
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

    // 4. Map Other Presence
    const otherPresence = wp.otherPresence ?? wp.otherOnlinePresence ?? [];
    if (Array.isArray(otherPresence)) {
      otherPresence.forEach((item: any, idx: number) => {
        const value = typeof item === "string" ? item : item?.url ?? item?.name;
        if (value) {
          addExposure(`other:${idx}`, {
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

    // 5. Extract from raw research (ONLY ONCE, deduplicated)
    if (typeof wp.rawResearch === "string") {
      const textExposures = extractIdentifiersFromText(wp.rawResearch, source);
      textExposures.forEach((exp) => {
        addExposure(`raw:${exp.ingredientKey}:${exp.exposureData.value}`, exp);
      });
    }

    console.log(`[perplexityMapper] Total unique exposures: ${exposures.length}`);
    
    return exposures;
  } catch (error) {
    console.error("Error mapping Perplexity response:", error);
    return exposures;
  }
}
