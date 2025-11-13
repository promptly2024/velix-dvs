export const extractPanAadhaar = (text: string) => {
    const panRegex = /([A-Z]{5}[0-9]{4}[A-Z])/g;
    const aadhaarRegex = /\b(\d{4}\s?\d{4}\s?\d{4})\b/g;

    const panMatch = text.match(panRegex);
    const aadhaarMatch = text.match(aadhaarRegex);

    return {
        pan: panMatch ? panMatch[0] : null,
        aadhaar: aadhaarMatch ? aadhaarMatch[0].replace(/\s+/g, "") : null,
    };
};
