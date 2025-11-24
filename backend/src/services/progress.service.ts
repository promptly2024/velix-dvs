import { prisma } from "../lib/prisma";

export class ProgressService {
    // Get all levels
    async getAllLevels() {
        return await prisma.gameLevel.findMany({
            orderBy: { levelNumber: 'asc' }
        });
    }

    // Get all user attempts
    async getAllUserAttempts(userId: string) {
        return await prisma.userLevelAttempt.findMany({
            where: { userId },
            include: {
                level: true
            }
        });
    }

    // Get user attempts for specific level with responses
    async getUserLevelAttemptsWithResponses(userId: string, levelId: string) {
        return await prisma.userLevelAttempt.findMany({
            where: {
                userId,
                levelId
            },
            orderBy: {
                attemptNumber: 'desc'
            },
            include: {
                responses: {
                    include: {
                        query: true
                    }
                }
            }
        });
    }

    // Get level by number
    async getLevelByNumber(levelNumber: number) {
        return await prisma.gameLevel.findUnique({
            where: { levelNumber }
        });
    }

    // Count total attempts
    async countUserAttempts(userId: string) {
        return await prisma.userLevelAttempt.count({
            where: { userId }
        });
    }

    // Count passed attempts
    async countPassedAttempts(userId: string) {
        return await prisma.userLevelAttempt.count({
            where: { userId, isPassed: true }
        });
    }

    // Count total responses
    async countUserResponses(userId: string) {
        return await prisma.userResponse.count({
            where: {
                attempt: {
                    userId
                }
            }
        });
    }

    // Count correct responses
    async countCorrectResponses(userId: string) {
        return await prisma.userResponse.count({
            where: {
                attempt: {
                    userId
                },
                isCorrect: true
            }
        });
    }

    // Sum total points
    async sumUserPoints(userId: string) {
        return await prisma.userLevelAttempt.aggregate({
            where: { userId, isPassed: true },
            _sum: {
                scoreAchieved: true
            }
        });
    }

    // Find active attempt
    async findActiveAttempt(userId: string) {
        return await prisma.userLevelAttempt.findFirst({
            where: {
                userId,
                finishedAt: null
            },
            include: {
                level: true
            }
        });
    }
}

export default new ProgressService();
