import { z } from 'zod';
import { Request, Response } from 'express';
import { levelService } from '../../services/levelService.services';
import { sceneService } from '../../services/sceneServices';

const createSceneSchema = z.object({
    levelId: z.uuid(),
    sceneNumber: z.number().int(),
    sceneType: z.enum(["VIDEO", "IMAGES", "TEXT"]),
    mediaUrls: z.array(z.url()).max(10)
});

export const createSceneController = async (req: Request, res: Response) => {
    try {
        const sceneData = createSceneSchema.parse(req.body);
        const existingLevel = await levelService.getLevelById(sceneData.levelId);
        if (!existingLevel) {
            return res.status(404).json({ success: false, message: 'Level not found' });
        }
        const createdScene = await sceneService.createScene(sceneData);
        res.status(201).json({ success: true, data: createdScene });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(400).json({ success: false, message });
    }
};

export const updateSceneController = async (req: Request, res: Response) => {
    try {
        const sceneId = req.params.sceneId;
        const sceneData = createSceneSchema.partial().parse(req.body);
        const existingScene = await sceneService.getSceneById(sceneId);
        if (!existingScene) {
            return res.status(404).json({ success: false, message: 'Scene not found' });
        }
        const updatedScene = await sceneService.updateScene(sceneId, sceneData);
        res.status(200).json({ success: true, data: updatedScene });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(400).json({ success: false, message });
    }
};

export const getSceneByLevelIdController = async (req: Request, res: Response) => {
    try {
        const levelId = req.params.levelId;
        const level = await levelService.getLevelById(levelId);
        if (!level) {
            return res.status(404).json({ success: false, message: 'Level not found' });
        }
        const scene = await sceneService.getSceneByLevelId(levelId);
        if (!scene) {
            return res.status(404).json({ success: false, message: 'Scene not found for this level' });
        }
        res.status(200).json({ success: true, data: scene });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ success: false, message });
    }
};

// delete scene
export const deleteSceneController = async (req: Request, res: Response) => {
    try {
        const levelId = req.params.levelId;
        const level = await levelService.getLevelById(levelId);
        if (!level) {
            return res.status(404).json({ success: false, message: 'Level not found' });
        }
        const scene = await sceneService.getSceneByLevelId(levelId);
        if (!scene) {
            return res.status(404).json({ success: false, message: 'Scene not found for this level' });
        }
        await sceneService.deleteScene(scene.id);
        res.status(200).json({ success: true, message: 'Scene deleted successfully' });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ success: false, message });
    }
}