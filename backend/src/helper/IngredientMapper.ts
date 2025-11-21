import { ExposureSource } from "@prisma/client";

// Maps platform strings from scan findings to ThreatIngredient keys
export function mapPlatformToIngredientKey(platform: string, platformType: string | null) {
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

// Confidence heuristics by source
export function confidenceForSource(source: ExposureSource) {
    switch (source) {
        case "BREACH": return 0.95;
        case "WEB": return 0.6;
        case "SOCIAL": return 0.65;
        case "AI": return 0.5;
        default: return 0.5;
    }
}
