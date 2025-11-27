import { prisma } from "../lib/prisma";

export const sceneService = {
    createScene: async (sceneData: {
        levelId: string;
        sceneNumber: number;
        sceneType: "VIDEO" | "IMAGES" | "TEXT";
        mediaUrls: string[];
    }) => {
        const response = await prisma.levelScene.create({
            data: sceneData,
        });
        return response;
    },
    updateScene: async (sceneId: string, sceneData: {
        sceneNumber?: number;
        sceneType?: "VIDEO" | "IMAGES" | "TEXT";
        mediaUrls?: string[];
    }) => {
        const response = await prisma.levelScene.update({
            where: { id: sceneId },
            data: sceneData,
        });
        return response;
    },
    getSceneById: async (sceneId: string) => {
        const scene = await prisma.levelScene.findUnique({
            where: { id: sceneId },
        });
        return scene;
    },
    getSceneByLevelId: async (levelId: string) => {
        const scene = await prisma.levelScene.findFirst({
            where: { levelId },
            orderBy: { sceneNumber: 'asc' },
            include: { queries: true, level: true }
        });
        return scene;
    },
    getAllScenesByLevelId: async (levelId: string) => {
        const scenes = await prisma.levelScene.findMany({
            where: { levelId },
            orderBy: { sceneNumber: 'asc' },
            include: {
                queries: {
                    include: {
                        options: true
                    },
                    orderBy: { queryNumber: 'asc' }
                }
            }
        });
        return scenes;
    },
    deleteScene: async (sceneId: string) => {
        const response = await prisma.levelScene.delete({
            where: { id: sceneId },
        });
        return response;
    }
};