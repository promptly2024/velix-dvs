import { z } from 'zod';
import { Request, Response } from 'express';
import { levelService } from '../../services/levelService.services';
import { sceneService } from '../../services/sceneServices';
import { uploadMediaToCloudinary } from '../../utils/uploadToCloudinary';

const createSceneBodySchema = z.object({
    levelId: z.string(),
    sceneNumber: z.string().transform((val) => parseInt(val, 10)),
    sceneType: z.enum(["VIDEO", "IMAGES", "TEXT"]),
    textContent: z.string().optional(),
});

export const createSceneController = async (req: Request, res: Response) => {
    try {
        const parsedBody = createSceneBodySchema.parse(req.body);
        const files = req.files as Express.Multer.File[];

        // Validate level exists
        const existingLevel = await levelService.getLevelById(parsedBody.levelId);
        if (!existingLevel) {
            return res.status(404).json({ success: false, message: 'Level not found' });
        }

        let mediaUrls: string[] = [];

        if (parsedBody.sceneType === "TEXT") {
            if (!parsedBody.textContent) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Text content is required for TEXT scene type' 
                });
            }
            mediaUrls = [parsedBody.textContent];
            
        } else if (parsedBody.sceneType === "VIDEO") {
            if (!files || files.length !== 1) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Exactly one video file is required for VIDEO scene type' 
                });
            }

            const uploadResult = await uploadMediaToCloudinary(
                files[0].buffer,
                files[0].originalname,
                `scenes/level_${parsedBody.levelId}/videos`
            );
            mediaUrls = [uploadResult.secureUrl];
            
        } else if (parsedBody.sceneType === "IMAGES") {
            if (!files || files.length === 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'At least one image file is required for IMAGES scene type' 
                });
            }

            if (files.length > 10) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Maximum 10 images allowed per scene' 
                });
            }

            const uploadPromises = files.map(file => 
                uploadMediaToCloudinary(
                    file.buffer,
                    file.originalname,
                    `scenes/level_${parsedBody.levelId}/images`
                )
            );

            const uploadResults = await Promise.all(uploadPromises);
            mediaUrls = uploadResults.map(result => result.secureUrl);
        }

        const createdScene = await sceneService.createScene({
            levelId: parsedBody.levelId,
            sceneNumber: parsedBody.sceneNumber,
            sceneType: parsedBody.sceneType,
            mediaUrls: mediaUrls,
        });

        res.status(201).json({ 
            success: true, 
            message: 'Scene created successfully',
            data: createdScene 
        });
        
    } catch (error) {
        console.error('Create scene error:', error);
        
        if (error instanceof z.ZodError) {
            return res.status(400).json({ 
                success: false, 
                message: 'Validation error',
                errors: error
            });
        }
        
        const message = error instanceof Error ? error.message : String(error);
        res.status(400).json({ success: false, message });
    }
};

export const getSceneByLevelIdController = async (req: Request, res: Response) => {
    try {
        const { levelId } = req.params;
        const scene = await sceneService.getSceneByLevelId(levelId);
        
        if (!scene) {
            return res.status(404).json({ 
                success: false, 
                message: 'Scene not found for this level' 
            });
        }

        res.status(200).json({ success: true, data: scene });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ success: false, message });
    }
};

export const updateSceneController = async (req: Request, res: Response) => {
    try {
        const { sceneId } = req.params;
        const files = req.files as Express.Multer.File[];
        
        const updateData: any = {};
        
        if (req.body.sceneNumber) {
            updateData.sceneNumber = parseInt(req.body.sceneNumber, 10);
        }
        
        if (req.body.sceneType) {
            updateData.sceneType = req.body.sceneType;
        }

        if (files && files.length > 0) {
            const scene = await sceneService.getSceneById(sceneId);
            if (!scene) {
                return res.status(404).json({ success: false, message: 'Scene not found' });
            }

            let mediaUrls: string[] = [];
            const sceneType = req.body.sceneType || scene.sceneType;

            if (sceneType === "VIDEO") {
                const uploadResult = await uploadMediaToCloudinary(
                    files[0].buffer,
                    files[0].originalname,
                    `scenes/level_${scene.levelId}/videos`
                );
                mediaUrls = [uploadResult.secureUrl];
                
            } else if (sceneType === "IMAGES") {
                const uploadPromises = files.map(file => 
                    uploadMediaToCloudinary(
                        file.buffer,
                        file.originalname,
                        `scenes/level_${scene.levelId}/images`
                    )
                );
                const uploadResults = await Promise.all(uploadPromises);
                mediaUrls = uploadResults.map(result => result.secureUrl);
            }

            updateData.mediaUrls = mediaUrls;
        } else if (req.body.textContent && req.body.sceneType === "TEXT") {
            updateData.mediaUrls = [req.body.textContent];
        }

        const updatedScene = await sceneService.updateScene(sceneId, updateData);
        res.status(200).json({ success: true, data: updatedScene });
        
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(400).json({ success: false, message });
    }
};

export const deleteSceneController = async (req: Request, res: Response) => {
    try {
        const { levelId } = req.params;
        const scene = await sceneService.getSceneByLevelId(levelId);
        
        if (!scene) {
            return res.status(404).json({ success: false, message: 'Scene not found' });
        }

        await sceneService.deleteScene(scene.id);
        res.status(200).json({ success: true, message: 'Scene deleted successfully' });
        
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ success: false, message });
    }
};