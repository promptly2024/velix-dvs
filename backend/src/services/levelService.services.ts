import { prisma } from "../lib/prisma";

export const levelService = {
    createLevel: async (levelData: {
        levelNumber: number;
        title: string;
        description?: string;
        requiredScore: number;
        basePoints: number;
    }) => {
        const response = await prisma.gameLevel.create({
            data: levelData,
        });
        return response;
    },
    updateLevel: async (levelNumber: number, levelData: {
        title?: string;
        description?: string;
        requiredScore?: number;
        basePoints?: number;
    }) => {
        const response = await prisma.gameLevel.update({
            where: { levelNumber },
            data: levelData,
        });
        return response;
    },
    getLevelById: async (levelId: string) => {
        const level = await prisma.gameLevel.findUnique({
            where: { id: levelId },
        });
        return level;
    },
    getLevelByNumber: async (levelNumber: number) => {
        const level = await prisma.gameLevel.findUnique({
            where: { levelNumber },
        });
        return level;
    },
    getAllLevels: async (skip: number, take: number) => {
        const levels = await prisma.gameLevel.findMany({
            orderBy: { levelNumber: 'asc' },
            skip,
            take
        });
        return levels;
    },
    deleteLevel: async (levelNumber: number) => {
        const response = await prisma.gameLevel.delete({
            where: { levelNumber },
        });
        return response;
    },
};