import { calculateDeductions } from "../lib/calculateDeduction";
import { prisma } from "../lib/prisma";

export class GameService {
    // Get all levels
    async getAllLevels() {
        return await prisma.gameLevel.findMany({
            select: {
                id: true,
                levelNumber: true,
                title: true,
                description: true,
                requiredScore: true,
                basePoints: true
            },
            orderBy: {
                levelNumber: 'asc'
            }
        });
    }

    // Get user's attempts for a specific level
    async getUserLevelAttempts(userId: string, levelId: string) {
        return await prisma.userLevelAttempt.findMany({
            where: {
                userId,
                levelId
            },
            orderBy: {
                attemptNumber: 'desc'
            }
        });
    }

    // Get level by level number
    async getLevelByNumber(levelNumber: number) {
        return await prisma.gameLevel.findUnique({
            where: { levelNumber },
            include: {
                scenes: {
                    orderBy: { sceneNumber: 'asc' },
                    include: {
                        queries: {
                            orderBy: { queryNumber: 'asc' },
                            include: {
                                options: {
                                    select: {
                                        id: true,
                                        optionText: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
    }

    // Get user's attempt history for a level
    async getUserLevelAttemptsWithLimit(userId: string, levelId: string, limit: number = 5) {
        return await prisma.userLevelAttempt.findMany({
            where: {
                userId,
                levelId
            },
            orderBy: {
                attemptNumber: 'desc'
            },
            take: limit
        });
    }

    // Create new level attempt
    async createLevelAttempt(data: {
        userId: string;
        levelId: string;
        attemptNumber: number;
    }) {
        return await prisma.userLevelAttempt.create({
            data: {
                userId: data.userId,
                levelId: data.levelId,
                attemptNumber: data.attemptNumber,
                currentSceneNumber: 1,
                currentQueryNumber: 1,
                scoreAchieved: 0
            }
        });
    }

    // Find active attempt
    async findActiveAttempt(userId: string, levelId: string) {
        return await prisma.userLevelAttempt.findFirst({
            where: {
                userId,
                levelId,
                finishedAt: null
            }
        });
    }

    // Get attempt by ID
    async getAttemptById(attemptId: string) {
        return await prisma.userLevelAttempt.findUnique({
            where: { id: attemptId },
            include: {
                level: true
            }
        });
    }

    // Get attempt with responses
    async getAttemptWithResponses(attemptId: string) {
        return await prisma.userLevelAttempt.findUnique({
            where: { id: attemptId },
            include: {
                level: true,
                responses: true
            }
        });
    }

    // Get scene by level and scene number
    async getSceneByNumber(levelId: string, sceneNumber: number) {
        return await prisma.levelScene.findUnique({
            where: {
                levelId_sceneNumber: {
                    levelId,
                    sceneNumber
                }
            },
            include: {
                queries: true
            }
        });
    }

    // Get scene with specific query
    async getSceneWithQuery(levelId: string, sceneNumber: number, queryNumber: number) {
        return await prisma.levelScene.findUnique({
            where: {
                levelId_sceneNumber: {
                    levelId,
                    sceneNumber
                }
            },
            include: {
                queries: {
                    where: {
                        queryNumber
                    },
                    include: {
                        options: {
                            select: {
                                id: true,
                                optionText: true
                            }
                        }
                    }
                }
            }
        });
    }

    // Get query option
    async getQueryOption(optionId: string, queryId: string) {
        return await prisma.queryOption.findFirst({
            where: {
                id: optionId,
                queryId
            }
        });
    }

    // Check if response exists
    async findUserResponse(attemptId: string, queryId: string) {
        return await prisma.userResponse.findUnique({
            where: {
                attemptId_queryId: {
                    attemptId,
                    queryId
                }
            }
        });
    }

    // Create or update user response
    async upsertUserResponse(data: {
        attemptId: string;
        queryId: string;
        selectedOptionId: string;
        isCorrect: boolean;
        pointsEarned: number;
        isFirstTry: boolean;
    }) {
        return await prisma.$transaction(async (tx) => {
            const response = await tx.userResponse.upsert({
                where: {
                    attemptId_queryId: {
                        attemptId: data.attemptId,
                        queryId: data.queryId
                    }
                },
                create: {
                    attemptId: data.attemptId,
                    queryId: data.queryId,
                    selectedOptionId: data.selectedOptionId,
                    isCorrect: data.isCorrect,
                    pointsEarned: data.pointsEarned,
                    isFirstTry: true
                },
                update: {
                    selectedOptionId: data.selectedOptionId,
                    isCorrect: data.isCorrect,
                    pointsEarned: data.isCorrect && data.isFirstTry ? data.pointsEarned : 0,
                    isFirstTry: false
                }
            });

            // Find total game, total easy game, total medium game, total hard game available
            const [totalGames, totalEasyGames, totalMediumGames, totalHardGames] = await Promise.all([
                tx.gameLevel.count(),
                tx.gameLevel.count({ where: { type: 'EASY' } }),
                tx.gameLevel.count({ where: { type: 'MEDIUM' } }),
                tx.gameLevel.count({ where: { type: 'HARD' } })
            ]);

            const deduction = calculateDeductions(30, totalGames, totalEasyGames, totalMediumGames, totalHardGames);

            // Deduct points from user based on level type
            // Only deduct if the answer is correct and is first try
            if (data.isCorrect && data.isFirstTry) {
                const attempt = await tx.userLevelAttempt.findUnique({
                    where: { id: data.attemptId },
                    include: {
                        level: true
                    }
                });

                let pointsToDeduct = 0;
                if (attempt?.level.type === 'EASY') {
                    pointsToDeduct = deduction.easy;
                } else if (attempt?.level.type === 'MEDIUM') {
                    pointsToDeduct = deduction.medium;
                } else if (attempt?.level.type === 'HARD') {
                    pointsToDeduct = deduction.hard;
                }

                await tx.user.update({
                    where: { id: attempt!.userId },
                    data: {
                        dvsScore: {
                            decrement: pointsToDeduct
                        }
                    }
                });
            }

            return response;
        });
    }

    // Update attempt score
    async incrementAttemptScore(attemptId: string, points: number) {
        return await prisma.userLevelAttempt.update({
            where: { id: attemptId },
            data: {
                scoreAchieved: {
                    increment: points
                }
            }
        });
    }

    // Update attempt progress
    async updateAttemptProgress(attemptId: string, sceneNumber: number, queryNumber: number) {
        return await prisma.userLevelAttempt.update({
            where: { id: attemptId },
            data: {
                currentSceneNumber: sceneNumber,
                currentQueryNumber: queryNumber
            }
        });
    }

    // Count queries in a scene
    async countSceneQueries(sceneId: string) {
        return await prisma.sceneQuery.count({
            where: { sceneId }
        });
    }

    // Count scenes in a level
    async countLevelScenes(levelId: string) {
        return await prisma.levelScene.count({
            where: { levelId }
        });
    }

    // Count total queries in a level
    async countLevelQueries(levelId: string) {
        return await prisma.sceneQuery.count({
            where: {
                scene: {
                    levelId
                }
            }
        });
    }

    // Complete attempt
    async completeAttempt(attemptId: string, isPassed: boolean) {
        return await prisma.userLevelAttempt.update({
            where: { id: attemptId },
            data: {
                finishedAt: new Date(),
                isPassed
            }
        });
    }

    // Get level with all details (scenes, queries, options, hints)
    async getLevelFullDetails(levelNumber: number) {
        return await prisma.gameLevel.findUnique({
            where: { levelNumber },
            include: {
                scenes: {
                    orderBy: { sceneNumber: 'asc' },
                    include: {
                        queries: {
                            orderBy: { queryNumber: 'asc' },
                            include: {
                                options: {
                                    select: {
                                        id: true,
                                        optionText: true,
                                        pointsAwarded: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
    }


    async getQueryById(queryId: string) {
        return await prisma.sceneQuery.findUnique({
            where: { id: queryId }
        });
    }

    // Get scene by query
    async getSceneByQuery(queryId: string) {
        const query = await prisma.sceneQuery.findUnique({
            where: { id: queryId },
            include: {
                scene: true
            }
        });
        return query?.scene;
    }
}

export default new GameService();
