import { Request, Response } from "express";
import gameService from "../../services/game.service";

// GET all available levels
export const getAllLevelsController = async (req: Request, res: Response) => {
    if (!req.user?.userId) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    }
    const userId = req.user?.userId;
    const levels = await gameService.getAllLevels();

    // Get user's progress for each level
    const levelsWithProgress = await Promise.all(
        levels.map(async (level) => {
            const attempts = await gameService.getUserLevelAttempts(userId, level.id);

            const passedAttempt = attempts.find(a => a.isPassed);
            const failedAttempts = attempts.filter(a => !a.isPassed && a.finishedAt !== null);
            const activeAttempt = attempts.find(a => a.finishedAt === null);
            const bestScore = attempts.length > 0 ? Math.max(...attempts.map(a => a.scoreAchieved)) : 0;

            return {
                ...level,
                status: passedAttempt 
                    ? 'COMPLETED' 
                    : activeAttempt
                        ? 'IN_PROGRESS'
                        : failedAttempts.length > 0 
                            ? 'FAILED' 
                            : 'NOT_STARTED',
                isCompleted: !!passedAttempt,
                canStart: attempts.length === 0 && !activeAttempt,
                canRetry: failedAttempts.length > 0 && !passedAttempt && !activeAttempt,
                canContinue: !!activeAttempt,
                totalAttempts: attempts.length,
                bestScore,
                activeAttemptId: activeAttempt?.id || null
            };
        })
    );

    return res.status(200).json({
        success: true,
        data: levelsWithProgress,
        message: "Levels retrieved successfully"
    });
};

// GET specific level details
export const getLevelDetailsController = async (req: Request, res: Response) => {

    if (!req.user?.userId) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    }

    const { levelNumber } = req.params;
    const userId = req.user?.userId;

    const level = await gameService.getLevelByNumber(parseInt(levelNumber));

    if (!level) {
        return res.status(404).json({
            success: false,
            message: "Level not found"
        });
    }

    // Get user's previous attempts
    const attempts = await gameService.getUserLevelAttemptsWithLimit(userId, level.id, 5);

    return res.status(200).json({
        success: true,
        data: { level, attempts },
        message: "Level details retrieved successfully"
    });
};

// POST start a new level attempt
export const startLevelController = async (req: Request, res: Response) => {

    if (!req.user?.userId) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    }

    const { levelNumber } = req.params;
    const userId = req.user?.userId;

    const level = await gameService.getLevelByNumber(parseInt(levelNumber));

    if (!level) {
        return res.status(404).json({
            success: false,
            message: "Level not found"
        });
    }

    // Check if user has already attempted this level
    const previousAttempts = await gameService.getUserLevelAttempts(userId, level.id);

    // If user has already attempted this level, don't allow starting fresh
    if (previousAttempts.length > 0) {
        const hasPassedAttempt = previousAttempts.some(attempt => attempt.isPassed);
        const activeAttempt = previousAttempts.find(a => a.finishedAt === null);
        
        if (activeAttempt) {
            return res.status(200).json({
                success: true,
                data: activeAttempt,
                message: "You have an active attempt. Continue from where you left off."
            });
        }
        
        if (hasPassedAttempt) {
            return res.status(400).json({
                success: false,
                message: "You have already completed this level. You cannot reattempt it."
            });
        } else {
            return res.status(400).json({
                success: false,
                message: "You have already attempted this level. Use the retry endpoint to reattempt."
            });
        }
    }

    // Create new attempt (first attempt only)
    const newAttempt = await gameService.createLevelAttempt({
        userId,
        levelId: level.id,
        attemptNumber: 1
    });

    return res.status(201).json({
        success: true,
        data: newAttempt,
        message: "Level attempt started successfully"
    });
};

// POST retry failed level
export const retryLevelController = async (req: Request, res: Response) => {

    if (!req.user?.userId) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    }

    const { levelNumber } = req.params;
    const userId = req.user?.userId;

    const level = await gameService.getLevelByNumber(parseInt(levelNumber));

    if (!level) {
        return res.status(404).json({
            success: false,
            message: "Level not found"
        });
    }

    // Check previous attempts
    const previousAttempts = await gameService.getUserLevelAttempts(userId, level.id);

    // User must have at least one previous attempt
    if (previousAttempts.length === 0) {
        return res.status(400).json({
            success: false,
            message: "You haven't attempted this level yet. Use the start endpoint first."
        });
    }

    // Check if user has already passed this level
    const hasPassedAttempt = previousAttempts.some(attempt => attempt.isPassed);
    if (hasPassedAttempt) {
        return res.status(400).json({
            success: false,
            message: "You have already passed this level. You cannot retry a completed level."
        });
    }

    // Check if there's an active (unfinished) attempt
    const activeAttempt = previousAttempts.find(a => a.finishedAt === null);
    if (activeAttempt) {
        return res.status(200).json({
            success: true,
            data: activeAttempt,
            message: "You have an active attempt. Complete it first or continue from where you left off."
        });
    }

    // Check that all previous attempts are actually failed
    const completedAttempts = previousAttempts.filter(a => a.finishedAt !== null);
    if (completedAttempts.length === 0) {
        return res.status(400).json({
            success: false,
            message: "No completed attempts found. Please finish your current attempt first."
        });
    }

    // Get next attempt number
    const lastAttempt = previousAttempts[0];
    const attemptNumber = lastAttempt.attemptNumber + 1;

    // Create new retry attempt
    const retryAttempt = await gameService.createLevelAttempt({
        userId,
        levelId: level.id,
        attemptNumber
    });

    return res.status(201).json({
        success: true,
        data: retryAttempt,
        message: `Level retry started (Attempt ${attemptNumber})`
    });
};

// GET current scene for ongoing attempt
export const getSceneController = async (req: Request, res: Response) => {
    const { attemptId } = req.params;
    const userId = req.user?.userId;

    const attempt = await gameService.getAttemptById(attemptId);

    if (!attempt || attempt.userId !== userId) {
        return res.status(404).json({
            success: false,
            message: "Attempt not found or unauthorized"
        });
    }

    if (attempt.finishedAt) {
        return res.status(400).json({
            success: false,
            message: "This attempt is already completed"
        });
    }

    // Get current scene with query
    const scene = await gameService.getSceneWithQuery(
        attempt.levelId,
        attempt.currentSceneNumber,
        attempt.currentQueryNumber
    );

    if (!scene) {
        return res.status(404).json({
            success: false,
            message: "Scene not found"
        });
    }

    if (scene.queries.length === 0) {
        return res.status(404).json({
            success: false,
            message: "Current query not found"
        });
    }

    return res.status(200).json({
        success: true,
        data: {
            attempt,
            scene,
            currentQuery: scene.queries[0]
        },
        message: "Scene retrieved successfully"
    });
};

// POST submit answer for current query
export const submitAnswerController = async (req: Request, res: Response) => {
    const { attemptId } = req.params;
    const { selectedOptionId } = req.body;
    const userId = req.user?.userId;

    if (!selectedOptionId) {
        return res.status(400).json({
            success: false,
            message: "Selected option is required"
        });
    }

    const attempt = await gameService.getAttemptById(attemptId);

    if (!attempt || attempt.userId !== userId) {
        return res.status(404).json({
            success: false,
            message: "Attempt not found or unauthorized"
        });
    }

    if (attempt.finishedAt) {
        return res.status(400).json({
            success: false,
            message: "This attempt is already completed"
        });
    }

    // Get current scene and query
    const scene = await gameService.getSceneWithQuery(
        attempt.levelId,
        attempt.currentSceneNumber,
        attempt.currentQueryNumber
    );

    if (!scene || scene.queries.length === 0) {
        return res.status(404).json({
            success: false,
            message: "Current query not found"
        });
    }

    const currentQuery = scene.queries[0];

    // Get selected option
    const selectedOption = await gameService.getQueryOption(selectedOptionId, currentQuery.id);

    if (!selectedOption) {
        return res.status(404).json({
            success: false,
            message: "Invalid option selected"
        });
    }

    // Check if already answered
    const existingResponse = await gameService.findUserResponse(attempt.id, currentQuery.id);
    const isFirstTry = !existingResponse;

    // Create or update response
    const response = await gameService.upsertUserResponse({
        attemptId: attempt.id,
        queryId: currentQuery.id,
        selectedOptionId,
        isCorrect: selectedOption.isCorrect,
        pointsEarned: selectedOption.isCorrect ? selectedOption.pointsAwarded : 0,
        isFirstTry
    });

    // Update attempt score
    const updatedAttempt = await gameService.incrementAttemptScore(attempt.id, response.pointsEarned);

    // Check if should advance to next query/scene
    let shouldAdvance = selectedOption.isCorrect;
    let nextSceneNumber = attempt.currentSceneNumber;
    let nextQueryNumber = attempt.currentQueryNumber;
    let isLevelComplete = false;

    if (shouldAdvance) {
        // Check if there are more queries in this scene
        const totalQueries = await gameService.countSceneQueries(scene.id);

        if (attempt.currentQueryNumber < totalQueries) {
            nextQueryNumber += 1;
        } else {
            // Move to next scene
            const totalScenes = await gameService.countLevelScenes(attempt.levelId);

            if (attempt.currentSceneNumber < totalScenes) {
                nextSceneNumber += 1;
                nextQueryNumber = 1;
            } else {
                // Level completed
                isLevelComplete = true;
            }
        }

        if (!isLevelComplete) {
            // Update attempt progress
            await gameService.updateAttemptProgress(attempt.id, nextSceneNumber, nextQueryNumber);
        }
    }

    return res.status(200).json({
        success: true,
        data: {
            response,
            isCorrect: selectedOption.isCorrect,
            pointsEarned: response.pointsEarned,
            learningOutcome: currentQuery.learningOutcome,
            shouldAdvance,
            isLevelComplete,
            updatedScore: updatedAttempt.scoreAchieved
        },
        message: "Answer submitted successfully"
    });
};

// POST request hint for current query
export const useLevelHintController = async (req: Request, res: Response) => {
    const { attemptId } = req.params;
    const userId = req.user?.userId;

    const attempt = await gameService.getAttemptById(attemptId);

    if (!attempt || attempt.userId !== userId) {
        return res.status(404).json({
            success: false,
            message: "Attempt not found or unauthorized"
        });
    }

    // Get current query
    const scene = await gameService.getSceneWithQuery(
        attempt.levelId,
        attempt.currentSceneNumber,
        attempt.currentQueryNumber
    );

    if (!scene || scene.queries.length === 0) {
        return res.status(404).json({
            success: false,
            message: "Query not found"
        });
    }

    const currentQuery = scene.queries[0];

    return res.status(200).json({
        success: true,
        data: {
            hint: currentQuery.hintText || "No hint available for this question"
        },
        message: "Hint retrieved successfully"
    });
};

// POST complete level
export const completeLevelController = async (req: Request, res: Response) => {
    const { attemptId } = req.params;
    const userId = req.user?.userId;

    const attempt = await gameService.getAttemptWithResponses(attemptId);

    if (!attempt || attempt.userId !== userId) {
        return res.status(404).json({
            success: false,
            message: "Attempt not found or unauthorized"
        });
    }

    if (attempt.finishedAt) {
        return res.status(400).json({
            success: false,
            message: "This attempt is already completed"
        });
    }

    // Count total queries in this level
    const totalQueries = await gameService.countLevelQueries(attempt.levelId);

    // Check if all queries answered
    if (attempt.responses.length < totalQueries) {
        return res.status(400).json({
            success: false,
            message: "All questions must be answered before completing the level"
        });
    }

    const isPassed = attempt.scoreAchieved >= attempt.level.requiredScore;

    // Complete attempt
    const completedAttempt = await gameService.completeAttempt(attempt.id, isPassed);

    return res.status(200).json({
        success: true,
        data: {
            attempt: completedAttempt,
            isPassed,
            finalScore: attempt.scoreAchieved,
            requiredScore: attempt.level.requiredScore
        },
        message: isPassed ? "Level completed successfully!" : "Level failed. Try again!"
    });
};
