import { Request, Response } from "express";
import { z } from "zod";
import { questionService } from "../../services/questionService.services";
import { sceneService } from "../../services/sceneServices";

const createQuestionSchema = z.object({
    sceneId: z.string().uuid(),
    queryNumber: z.number().int().min(1).optional(),
    questionText: z.string(),
    learningOutcome: z.string().optional(),
    hintText: z.string().optional(),
});

export const createQuestionController = async (req: Request, res: Response) => {
    try {
        const questionData = createQuestionSchema.parse(req.body);
        if (questionData.queryNumber !== undefined && questionData.queryNumber < 1) {
            return res.status(400).json({ success: false, message: 'queryNumber must be >= 1' });
        }
        const scene = await sceneService.getSceneById(questionData.sceneId);
        if (!scene) {
            return res.status(404).json({ success: false, message: 'Scene not found' });
        }
        const newQuestion = await questionService.createQuestion(questionData);
        res.status(201).json({ success: true, data: newQuestion });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(400).json({ success: false, message });
    }
};

export const updateQuestionController = async (req: Request, res: Response) => {
    try {
        const questionId = req.params.questionId;
        const questionData = createQuestionSchema.partial().parse(req.body);
        const existingQuestion = await questionService.getQuestionById(questionId);
        if (!existingQuestion) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }
        const updatedQuestion = await questionService.updateQuestion(questionId, questionData);
        res.status(200).json({ success: true, data: updatedQuestion });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(400).json({ success: false, message });
    }
};

export const deleteQuestionController = async (req: Request, res: Response) => {
    try {
        const questionId = req.params.questionId;
        const deletedQuestion = await questionService.deleteQuestion(questionId);
        res.status(200).json({ success: true, data: deletedQuestion });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(400).json({ success: false, message });
    }
};

export const getQuestionByIdController = async (req: Request, res: Response) => {
    try {
        const questionId = req.params.questionId;
        const question = await questionService.getQuestionById(questionId);
        if (!question) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }
        res.status(200).json({ success: true, data: question });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(400).json({ success: false, message });
    }
};

export const getQuestionsBySceneIdController = async (req: Request, res: Response) => {
    try {
        const sceneId = req.params.sceneId;
        const questions = await questionService.getQuestionsBySceneId(sceneId);
        res.status(200).json({ success: true, data: questions });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(400).json({ success: false, message });
    }
};