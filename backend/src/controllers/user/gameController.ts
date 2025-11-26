import { Request, Response } from "express";
import gameService from "../../services/game.service";

// 1. GET all levels with user progress
export const getAllLevelsController = async (req: Request, res: Response) => {
    if (!req.user?.userId) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    }

    const userId = req.user.userId;
    const levels = await gameService.getAllLevels();

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
                totalAttempts: attempts.length,
                bestScore,
                activeAttempt: activeAttempt ? {
                    id: activeAttempt.id,
                    attemptNumber: activeAttempt.attemptNumber,
                    currentSceneNumber: activeAttempt.currentSceneNumber,
                    currentQueryNumber: activeAttempt.currentQueryNumber,
                    scoreAchieved: activeAttempt.scoreAchieved,
                    startedAt: activeAttempt.startedAt
                } : null
            };
        })
    );

    return res.status(200).json({
        success: true,
        data: levelsWithProgress,
        message: "Levels retrieved successfully"
    });
};

// single level full details with all scenes, queries, hints, options
export const getLevelFullDetailsController = async (req: Request, res: Response) => {
    if (!req.user?.userId) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    }

    const { levelNumber } = req.params;
    const userId = req.user.userId;

    const level = await gameService.getLevelFullDetails(parseInt(levelNumber));

    if (!level) {
        return res.status(404).json({
            success: false,
            message: "Level not found"
        });
    }

    // Get user's attempts for this level
    const attempts = await gameService.getUserLevelAttempts(userId, level.id);
    const activeAttempt = attempts.find(a => a.finishedAt === null);
    const passedAttempt = attempts.find(a => a.isPassed);

    // Start new attempt if no active attempt exists and level not completed
    let currentAttempt = activeAttempt;
    if (!activeAttempt && !passedAttempt) {
        const attemptNumber = attempts.length > 0 ? Math.max(...attempts.map(a => a.attemptNumber)) + 1 : 1;
        currentAttempt = await gameService.createLevelAttempt({
            userId,
            levelId: level.id,
            attemptNumber
        });
    }

    return res.status(200).json({
        success: true,
        data: {
            level,
            currentAttempt,
            attempts: attempts.slice(0, 5),
            isCompleted: !!passedAttempt
        },
        message: "Level details retrieved successfully"
    });

};


// 3. POST submit answer for any query
export const submitAnswerController = async (req: Request, res: Response) => {
    if (!req.user?.userId) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    }

    const { attemptId, queryId, selectedOptionId } = req.body;
    const userId = req.user.userId;

    if (!attemptId || !queryId || !selectedOptionId) {
        return res.status(400).json({
            success: false,
            message: "attemptId, queryId, and selectedOptionId are required"
        });
    }

    // Get attempt
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

    // Get query details
    const query = await gameService.getQueryById(queryId);

    if (!query) {
        return res.status(404).json({
            success: false,
            message: "Query not found"
        });
    }

    // Get selected option
    const selectedOption = await gameService.getQueryOption(selectedOptionId, queryId);

    if (!selectedOption) {
        return res.status(404).json({
            success: false,
            message: "Invalid option selected"
        });
    }

    // Check if already answered
    const existingResponse = await gameService.findUserResponse(attemptId, queryId);
    const isFirstTry = !existingResponse;

    // Create or update response
    const response = await gameService.upsertUserResponse({
        attemptId,
        queryId,
        selectedOptionId,
        isCorrect: selectedOption.isCorrect,
        pointsEarned: selectedOption.isCorrect && isFirstTry ? selectedOption.pointsAwarded : 0,
        isFirstTry
    });
 
    // Update attempt score if points earned
    if (response.pointsEarned > 0) {
        await gameService.incrementAttemptScore(attemptId, response.pointsEarned);
    }

    // Get updated attempt
    const updatedAttempt = await gameService.getAttemptById(attemptId);

    // Check if this was the correct answer and update progress
    if (selectedOption.isCorrect && isFirstTry) {
        // Check if query matches current position
        const scene = await gameService.getSceneByQuery(queryId);
        
        if (scene && 
            scene.sceneNumber === attempt.currentSceneNumber && 
            query.queryNumber === attempt.currentQueryNumber) {
            
            // Advance to next query/scene
            const totalQueries = await gameService.countSceneQueries(scene.id);

            if (attempt.currentQueryNumber < totalQueries) {
                // Move to next query in same scene
                await gameService.updateAttemptProgress(
                    attemptId, 
                    attempt.currentSceneNumber, 
                    attempt.currentQueryNumber + 1
                );
            } else {
                // Move to next scene
                const totalScenes = await gameService.countLevelScenes(attempt.levelId);
                
                if (attempt.currentSceneNumber < totalScenes) {
                    await gameService.updateAttemptProgress(
                        attemptId, 
                        attempt.currentSceneNumber + 1, 
                        1
                    );
                } else {
                    // Level complete - finalize attempt
                    const isPassed = updatedAttempt!.scoreAchieved >= attempt.level.requiredScore;
                    await gameService.completeAttempt(attemptId, isPassed);
                    
                    return res.status(200).json({
                        success: true,
                        data: {
                            response,
                            isCorrect: selectedOption.isCorrect,
                            pointsEarned: response.pointsEarned,
                            learningOutcome: query.learningOutcome,
                            updatedScore: updatedAttempt!.scoreAchieved,
                            isLevelComplete: true,
                            isPassed
                        },
                        message: isPassed ? "Level completed successfully!" : "Level completed but not passed. Try again!"
                    });
                }
            }
        }
    }

    return res.status(200).json({
        success: true,
        data: {
            response,
            isCorrect: selectedOption.isCorrect,
            pointsEarned: response.pointsEarned,
            learningOutcome: query.learningOutcome,
            updatedScore: updatedAttempt!.scoreAchieved,
            isLevelComplete: false
        },
        message: "Answer submitted successfully"
    });
};