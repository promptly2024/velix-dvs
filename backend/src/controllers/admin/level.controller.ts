import { z } from 'zod';
import { Request, Response } from 'express';
import { levelService } from '../../services/levelService.services';

const createLevelSchema = z.object({
    levelNumber: z.number().int(),
    title: z.string().min(2),
    description: z.string().optional(),
    requiredScore: z.number().int().min(1),
    basePoints: z.number().int().min(0)
});

export const createLevelController = async (req: Request, res: Response) => {
    try {
        const levelData = createLevelSchema.parse(req.body);
        const newLevel = await levelService.createLevel(levelData);
        res.status(201).json({ success: true, data: newLevel });
    } catch (error) {
        res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Invalid data' });
    }
};

export const updateLevelController = async (req: Request, res: Response) => {
    try {
        const levelNumber = parseInt(req.params.levelNumber, 10);
        const levelData = createLevelSchema.partial().parse(req.body);
        const existingLevel = await levelService.getLevelByNumber(levelNumber);
        if (!existingLevel) {
            return res.status(404).json({ success: false, message: 'Level not found' });
        }
        const updatedLevel = await levelService.updateLevel(levelNumber, levelData);
        res.status(200).json({ success: true, data: updatedLevel });
    } catch (error) {
        res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Invalid data' });
    }   
};

export const getAllLevelsController = async (req: Request, res: Response) => {
    try {
        const levels = await levelService.getAllLevels(0, 100); // default pagination currently
        res.status(200).json({ success: true, data: levels });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getLevelByNumberController = async (req: Request, res: Response) => {
    try {
        const levelNumber = parseInt(req.params.levelNumber, 10);
        const level = await levelService.getLevelByNumber(levelNumber);
        if (!level) {
            return res.status(404).json({ success: false, message: 'Level not found' });
        }
        res.status(200).json({ success: true, data: level });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};