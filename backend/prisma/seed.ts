import { PrismaClient, DetectionSource } from "@prisma/client";
const prisma = new PrismaClient();

// to run this seed file: npx prisma db seed or npx ts-node prisma/seed1.ts

function ing(key: string, name: string, sources: DetectionSource[], scam: string) {
    return { key, name, detectionSources: sources, possibleScam: scam };
}

async function main() {
    console.log("Seeding Threat Categories + Ingredients...");

    const threats = [
        {
            key: "FINANCIAL_THREAT",
            name: "Financial Threat",
            ingredients: [
                ing("upi_id", "UPI ID", ["WEB_SEARCH", "DARK_WEB"], "UPI fraud"),
                ing("bank_account_number", "Bank Account Number", ["WEB_SEARCH"], "KYC scam"),
                ing("credit_card_number", "Credit Card Number", ["WEB_SEARCH"], "Card scam")
            ]
        },

        {
            key: "IDENTITY_THEFT_RISK",
            name: "Identity Theft Risk",
            ingredients: [
                ing("email_id", "Email ID", ["BREACH", "WEB_SEARCH"], "Email hack"),
                ing("phone_number", "Phone Number", ["BREACH", "WEB_SEARCH"], "OTP scam"),
                ing("full_name", "Full Name", ["WEB_SEARCH"], "Fake identity"),
                ing("photo", "Photograph", ["WEB_SEARCH", "SOCIAL_SEARCH"], "Fake profile"),
                ing("aadhaar_number", "Aadhaar Number", ["WEB_SEARCH"], "Identity leak")
            ]
        },

        {
            key: "PROFESSIONAL_EXPOSURE",
            name: "Professional Exposure",
            ingredients: [
                ing("resume", "Resume", ["WEB_SEARCH"], "Fake HR scam"),
                ing("linkedin_id", "LinkedIn ID", ["WEB_SEARCH"], "Recruiter scam")
            ]
        },

        {
            key: "SOCIAL_MEDIA_VULNERABILITY",
            name: "Social Media Vulnerability",
            ingredients: [
                ing("facebook_profile", "Facebook Profile", ["WEB_SEARCH"], "Fake FB profile"),
                ing("instagram_profile", "Instagram Profile", ["WEB_SEARCH"], "IG impersonation"),
                ing("whatsapp_number", "WhatsApp Number", ["BREACH"], "WhatsApp takeover")
            ]
        },

        {
            key: "COMMUNICATION_SECURITY",
            name: "Communication Security",
            ingredients: [
                ing("password_leak", "Password Leak", ["BREACH"], "Account takeover"),
                ing("email_id", "Email ID", ["BREACH", "WEB_SEARCH"], "Email phishing")
            ]
        },

        {
            key: "DIGITAL_FOOTPRINT_RISK",
            name: "Digital Footprint Risk",
            ingredients: [
                ing("web_mentions", "Web Mentions", ["WEB_SEARCH"], "Profiling scam"),
                ing("breached_accounts", "Breached Accounts", ["BREACH"], "Credential stuffing")
            ]
        },

        {
            key: "ACCOUNT_SECURITY_THREAT",
            name: "Account Security Threat",
            ingredients: [
                ing("username", "Username", ["WEB_SEARCH"], "Bruteforce risk"),
                ing("password_leak", "Password Leak", ["BREACH"], "Account hack")
            ]
        },

        {
            key: "DIGITAL_REPUTATION_THREAT",
            name: "Digital Reputation Threat",
            ingredients: [
                ing("negative_mentions", "Negative Mentions", ["WEB_SEARCH"], "Reputation scam"),
                ing("fake_profiles", "Fake Profiles", ["WEB_SEARCH"], "Impersonation risk")
            ]
        }
    ];

    for (const t of threats) {
        console.log(`Seeding Threat Category: ${t.name}`);
        let alreadyAdded: boolean = false;

        const threat = await prisma.threatCategory.upsert({
            where: { key: t.key },
            update: {
                name: t.name,
            },
            create: {
                key: t.key,
                name: t.name
            }
        });

        // seed ingredients under this threat
        for (const ing of t.ingredients) {
            await prisma.threatIngredient.upsert({
                where: { key: ing.key },
                update: {
                    name: ing.name,
                    detectionSources: ing.detectionSources,
                    possibleScam: ing.possibleScam
                },
                create: {
                    key: ing.key,
                    name: ing.name,
                    detectionSources: ing.detectionSources,
                    possibleScam: ing.possibleScam,
                    threatCategoryId: threat.id
                }
            });
        }
        console.log(`\nFinished seeding Threat Category: ${t.name} ✔\n`);
    }

    console.log("\n\nSeed Completed ✔");
}

main().catch((e) => {
    console.error(e);
    // process.exit(1);
}).finally(() => {
    prisma.$disconnect();
    console.log("Disconnected from database.");
});
