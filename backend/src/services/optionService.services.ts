import { prisma } from "../lib/prisma";

export const optionServices = {
    createOption: async (optionData: {
        queryId: string;
        optionText: string;
        isCorrect: boolean;
        pointsAwarded: number;
    }) => {
        const response = await prisma.queryOption.create({ data: optionData });
        return response;
    },

    getOptionsByQueryId: async (queryId: string) => {
        const options = await prisma.queryOption.findMany({ where: { queryId } });
        return options;
    },

    getOptionById: async (optionId: string) => {
        const option = await prisma.queryOption.findUnique({ where: { id: optionId } });
        return option;
    },

    updateOption: async (
        optionId: string,
        optionData: {
            optionText?: string;
            isCorrect?: boolean;
            pointsAwarded?: number;
        }
    ) => {
        const updatedOption = await prisma.queryOption.update({ where: { id: optionId }, data: optionData });
        return updatedOption;
    },

    deleteOption: async (optionId: string) => {
        const deletedOption = await prisma.queryOption.delete({ where: { id: optionId } });
        return deletedOption;
    },
};