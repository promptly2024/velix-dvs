import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// to run this seed file: npx prisma db seed or npx ts-node prisma/seed.ts

// Default gamified mode levels configuration
const levelsSeed = [
    {
        levelNumber: 1,
        title: "OTP Theft Awareness",
        description: "Recognize and block OTP theft attempts.",
        type: "EASY",
        requiredScore: 80,
        basePoints: 100,
        scenes: [
            {
                sceneNumber: 1,
                sceneType: "VIDEO",
                mediaUrls: ["https://example.com/media/otp-theft-intro.mp4"],
                queries: [
                    {
                        queryNumber: 1,
                        questionText: "You receive a call asking for the OTP you just received. What is the safest action?",
                        learningOutcome: "Never share OTP with anyone, even if they claim to be official.",
                        hintText: "OTP is One Time Password.",
                        options: [
                            { optionText: "Share the OTP to resolve the issue fast", isCorrect: false, pointsAwarded: 0 },
                            { optionText: "Refuse and contact official support yourself", isCorrect: true, pointsAwarded: 80 },
                            { optionText: "Ignore and block the number", isCorrect: true, pointsAwarded: 80 }
                        ]
                    }
                ]
            }
        ]
    },
    {
        levelNumber: 2,
        title: "Phishing Email Detection",
        description: "Identify phishing red flags in emails.",
        type: "MEDIUM",
        requiredScore: 85,
        basePoints: 120,
        scenes: [
            {
                sceneNumber: 1,
                sceneType: "IMAGES",
                mediaUrls: ["https://example.com/media/phishing-email.png"],
                queries: [
                    {
                        queryNumber: 1,
                        questionText: "Which element is a phishing indicator?",
                        learningOutcome: "Suspicious links and urgent tone are classic phishing signs.",
                        hintText: "Look for urgency or mismatched domains.",
                        options: [
                            { optionText: "Generic greeting and urgent action demand", isCorrect: true, pointsAwarded: 85 },
                            { optionText: "Proper company logo", isCorrect: false, pointsAwarded: 0 },
                            { optionText: "Email footer with address", isCorrect: false, pointsAwarded: 0 }
                        ]
                    }
                ]
            }
        ]
    },
    {
        levelNumber: 3,
        title: "Password Hygiene",
        description: "Learn strong password practices.",
        type: "HARD",
        requiredScore: 75,
        basePoints: 90,
        scenes: [
            {
                sceneNumber: 1,
                sceneType: "TEXT",
                mediaUrls: [],
                queries: [
                    {
                        queryNumber: 1,
                        questionText: "Which password example is strongest?",
                        learningOutcome: "Use length + complexity + uniqueness.",
                        hintText: "Passphrases work well.",
                        options: [
                            { optionText: "Summer2024", isCorrect: false, pointsAwarded: 0 },
                            { optionText: "P@55w0rd!", isCorrect: false, pointsAwarded: 0 },
                            { optionText: "Purple_Tiger!Drinks#7+Cloud", isCorrect: true, pointsAwarded: 75 }
                        ]
                    }
                ]
            }
        ]
    },
    {
        levelNumber: 4,
        title: "Social Engineering Chat",
        description: "Spot manipulation in chat interactions.",
        type: "MEDIUM",
        requiredScore: 80,
        basePoints: 110,
        scenes: [
            {
                sceneNumber: 1,
                sceneType: "TEXT",
                mediaUrls: [],
                queries: [
                    {
                        queryNumber: 1,
                        questionText: "A chat agent pressures you to reveal an account number. Best response?",
                        learningOutcome: "Never disclose sensitive info under pressure.",
                        hintText: "Assert control.",
                        options: [
                            { optionText: "Provide partial info", isCorrect: false, pointsAwarded: 0 },
                            { optionText: "Refuse and verify via official channel", isCorrect: true, pointsAwarded: 80 },
                            { optionText: "Continue and share after more questioning", isCorrect: false, pointsAwarded: 0 }
                        ]
                    }
                ]
            }
        ]
    },
    {
        levelNumber: 5,
        title: "Public Wi-Fi Risk",
        description: "Understand dangers of unsecured networks.",
        type: "MEDIUM",
        requiredScore: 85,
        basePoints: 130,
        scenes: [
            {
                sceneNumber: 1,
                sceneType: "VIDEO",
                mediaUrls: ["https://example.com/media/public-wifi.mp4"],
                queries: [
                    {
                        queryNumber: 1,
                        questionText: "Safest action when using public Wi-Fi?",
                        learningOutcome: "Use VPN and avoid sensitive transactions.",
                        hintText: "Encryption matters.",
                        options: [
                            { optionText: "Log into banking immediately", isCorrect: false, pointsAwarded: 0 },
                            { optionText: "Use a VPN and limit sensitive activity", isCorrect: true, pointsAwarded: 85 },
                            { optionText: "Disable firewall for speed", isCorrect: false, pointsAwarded: 0 }
                        ]
                    }
                ]
            }
        ]
    }
];

async function seedGamifiedLevels() {
    for (const lvl of levelsSeed) {
        const existing = await prisma.gameLevel.findUnique({ where: { levelNumber: lvl.levelNumber } });
        if (existing) {
            console.log(`Level ${lvl.levelNumber} already exists. Skipping.`);
            continue;
        }
        await prisma.gameLevel.create({
            data: {
                levelNumber: lvl.levelNumber,
                title: lvl.title,
                description: lvl.description,
                requiredScore: lvl.requiredScore,
                basePoints: lvl.basePoints,
                scenes: {
                    create: lvl.scenes.map(s => ({
                        sceneNumber: s.sceneNumber,
                        sceneType: s.sceneType as any,
                        mediaUrls: s.mediaUrls,
                        queries: {
                            create: s.queries.map(q => ({
                                queryNumber: q.queryNumber,
                                questionText: q.questionText,
                                learningOutcome: q.learningOutcome,
                                hintText: q.hintText,
                                options: {
                                    create: q.options.map(o => ({
                                        optionText: o.optionText,
                                        isCorrect: o.isCorrect,
                                        pointsAwarded: o.pointsAwarded
                                    }))
                                }
                            }))
                        }
                    }))
                }
            }
        });
        console.log(`Seeded Level ${lvl.levelNumber}: ${lvl.title}`);
    }
}

async function main() {
    console.log("Seeding Gamified mode Default five levels...");
    await seedGamifiedLevels();
    console.log("\nSeed Completed ✔");
}

main().catch((e) => {
    console.error(e);
}).finally(() => {
    prisma.$disconnect();
    console.log("Disconnected from database.");
});
