import { Request, Response } from "express";
import progressService from "../../services/progress.service";

// GET user's overall progress
export const getUserOverallProgressController = async (req: Request, res: Response) => {

    if (!req.user?.userId) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    }
    const userId = req.user?.userId;

    const allLevels = await progressService.getAllLevels();
    const userAttempts = await progressService.getAllUserAttempts(userId);

    const progressByLevel = allLevels.map(level => {
        const levelAttempts = userAttempts.filter(a => a.levelId === level.id);
        const passedAttempt = levelAttempts.find(a => a.isPassed);
        const bestScore = levelAttempts.length > 0 ? Math.max(...levelAttempts.map(a => a.scoreAchieved)) : 0;

        return {
            levelNumber: level.levelNumber,
            title: level.title,
            totalAttempts: levelAttempts.length,
            isPassed: !!passedAttempt,
            bestScore,
            requiredScore: level.requiredScore
        };
    });

    const totalLevels = allLevels.length;
    const completedLevels = progressByLevel.filter(p => p.isPassed).length;
    const totalScore = progressByLevel.reduce((sum, p) => sum + p.bestScore, 0);

    return res.status(200).json({
        success: true,
        data: {
            totalLevels,
            completedLevels,
            totalScore,
            progressByLevel
        },
        message: "Progress retrieved successfully"
    });
};

// GET user's attempt history for specific level
export const getUserLevelHistoryController = async (req: Request, res: Response) => {
    if (!req.user?.userId) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    }

    const { levelNumber } = req.params;
    const userId = req.user?.userId;

    const level = await progressService.getLevelByNumber(parseInt(levelNumber));

    if (!level) {
        return res.status(404).json({
            success: false,
            message: "Level not found"
        });
    }

    const attempts = await progressService.getUserLevelAttemptsWithResponses(userId, level.id);

    return res.status(200).json({
        success: true,
        data: { level, attempts },
        message: "Level history retrieved successfully"
    });
};

// GET user's game statistics
export const getUserStatsController = async (req: Request, res: Response) => {

    if (!req.user?.userId) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    }

    const userId = req.user?.userId;

    const totalAttempts = await progressService.countUserAttempts(userId);
    const passedAttempts = await progressService.countPassedAttempts(userId);
    const totalResponses = await progressService.countUserResponses(userId);
    const correctResponses = await progressService.countCorrectResponses(userId);
    const totalPoints = await progressService.sumUserPoints(userId);

    return res.status(200).json({
        success: true,
        data: {
            totalAttempts,
            passedAttempts,
            failedAttempts: totalAttempts - passedAttempts,
            totalResponses,
            correctResponses,
            accuracy: totalResponses > 0 ? ((correctResponses / totalResponses) * 100).toFixed(2) : 0,
            totalPoints: totalPoints._sum.scoreAchieved || 0
        },
        message: "Stats retrieved successfully"
    });
};

// GET current active attempt
export const getCurrentAttemptController = async (req: Request, res: Response) => {

    if (!req.user?.userId) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    }

    const userId = req.user?.userId;

    const activeAttempt = await progressService.findActiveAttempt(userId);

    return res.status(200).json({
        success: true,
        data: activeAttempt,
        message: activeAttempt ? "Active attempt found" : "No active attempt"
    });
};
