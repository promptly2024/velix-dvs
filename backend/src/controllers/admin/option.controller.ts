import { z } from "zod";
import { Request, Response } from "express";
import { sceneService } from "../../services/sceneServices";
import { optionServices } from "../../services/optionService.services";

const createOptionSchema = z.object({
    queryId: z.uuid(),
    optionText: z.string().min(1, { message: "Option text cannot be empty" }),
    isCorrect: z.boolean(),
    pointsAwarded: z.number().int()
});

export const createOptionController = async (req: Request, res: Response) => {
    try {
        const optionData = createOptionSchema.parse(req.body);
        const existingQuery = await optionServices.getQueryId(optionData.queryId);
        if (!existingQuery) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }
        const createdOption = await optionServices.createOption(optionData);
        res.status(201).json({ success: true, data: createdOption });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(400).json({ success: false, message });
    }
};

export const getOptionsByQueryIdController = async (req: Request, res: Response) => {
    try {
        const queryId = req.params.queryId;
        const existingQuery = await sceneService.getSceneById(queryId);
        if (!existingQuery) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }
        const options = await optionServices.getOptionsByQueryId(queryId);
        res.status(200).json({ success: true, data: options });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ success: false, message });
    }
};

export const updateOptionController = async (req: Request, res: Response) => {
    try {
        const optionId = req.params.optionId;
        const optionData = createOptionSchema.partial().parse(req.body);
        const existingOption = await optionServices.getOptionById(optionId);
        if (!existingOption) {
            return res.status(404).json({ success: false, message: 'Option not found' });
        }
        const updatedOption = await optionServices.updateOption(optionId, optionData);
        res.status(200).json({ success: true, data: updatedOption });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(400).json({ success: false, message });
    }
};

export const deleteOptionController = async (req: Request, res: Response) => {
    try {
        const optionId = req.params.optionId;
        const existingOption = await optionServices.getOptionById(optionId);
        if (!existingOption) {
            return res.status(404).json({ success: false, message: 'Option not found' });
        }
        await optionServices.deleteOption(optionId);
        res.status(200).json({ success: true, message: 'Option deleted successfully' });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ success: false, message });
    }
};