
// mask the value for privacy
export function maskValue(key: string, value?: string) {
    if (!value) return null;
    const v = value.trim();
    if (key === "email_id") {
        const parts = v.split("@");
        if (parts.length === 2) {
            const local = parts[0];
            const keep = local[0] || "";
            const maskedCount = Math.max(0, local.length - keep.length);
            const stars = "*".repeat(maskedCount);
            return `${keep}${stars}@${parts[1]}`;
        }
        return v;
    }
    if (/^\+?\d{6,}$/.test(v)) { // phone like
        const prefix = v.slice(0, 3);
        const suffix = v.slice(-2);
        const maskedCount = Math.max(0, v.length - (prefix.length + suffix.length));
        const stars = "*".repeat(maskedCount);
        return prefix + stars + suffix;
    }
    // generic mask
    if (v.length > 8) {
        const prefix = v.slice(0, 3);
        const suffix = v.slice(-3);
        const maskedCount = Math.max(0, v.length - (prefix.length + suffix.length));
        const stars = "*".repeat(maskedCount);
        return prefix + stars + suffix;
    }
    return v;
}

const SCAN_TO_INGREDIENT_KEYS: Record<string, string[]> = {
    "email": ["email_id"],
    "emailBreach": ["email_id"],
    "password_leak": ["password_leak"],
    "web_mentions": ["web_mentions"],
    "PLATFORM_GITHUB": ["web_mentions"],
    "PLATFORM_PROFESSIONAL": ["web_mentions"],
    "PLATFORM_OTHER": ["web_mentions"]
};