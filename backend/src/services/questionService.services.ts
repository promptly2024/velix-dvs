import { prisma } from "../lib/prisma";
import { SceneQuery } from "@prisma/client";

interface CreateQuestionData {
    sceneId: string;
    queryNumber?: number;
    questionText: string;
    learningOutcome?: string;
    hintText?: string;
}

interface UpdateQuestionData {
    sceneId?: string;
    queryNumber?: number;
    questionText?: string;
    learningOutcome?: string;
    hintText?: string;
}

export const questionService = {
    createQuestion: async (questionData: CreateQuestionData): Promise<SceneQuery> => {
        const { sceneId, queryNumber: providedQueryNumber, ...restData } = questionData;

        // Validate scene exists
        const sceneExists = await prisma.levelScene.findUnique({
            where: { id: sceneId },
            select: { id: true }
        });

        if (!sceneExists) {
            throw new Error(`Scene not found with id: ${sceneId}`);
        }

        // Get current max queryNumber for the scene
        const maxExisting = await prisma.sceneQuery.findFirst({
            where: { sceneId },
            orderBy: { queryNumber: 'desc' },
            select: { queryNumber: true }
        });
        const maxQueryNumber = maxExisting?.queryNumber ?? 0;

        const queryNumber = providedQueryNumber ?? maxQueryNumber + 1;

        if (queryNumber < 1) {
            throw new Error('queryNumber must be at least 1');
        }

        if (queryNumber > maxQueryNumber + 1) {
            throw new Error(
                `Invalid queryNumber: ${queryNumber}. Maximum allowed is ${maxQueryNumber + 1}`
            );
        }

        // Check if position is occupied
        const existingAtPosition = await prisma.sceneQuery.findUnique({
            where: {
                sceneId_queryNumber: { sceneId, queryNumber }
            },
            select: { id: true }
        });

        // If position occupied, shift existing questions and insert new one
        if (existingAtPosition) {
            const [, created] = await prisma.$transaction([
                prisma.sceneQuery.updateMany({
                    where: {
                        sceneId,
                        queryNumber: { gte: queryNumber }
                    },
                    data: { queryNumber: { increment: 1 } }
                }),
                prisma.sceneQuery.create({
                    data: {
                        sceneId,
                        queryNumber,
                        ...restData
                    }
                })
            ]);
            return created;
        }

        // Create question at the specified position
        return await prisma.sceneQuery.create({
            data: {
                sceneId,
                queryNumber,
                ...restData
            }
        });
    },

    getQuestionById: async (questionId: string): Promise<SceneQuery | null> => {
        if (!questionId?.trim()) {
            throw new Error('questionId is required');
        }

        return await prisma.sceneQuery.findUnique({
            where: { id: questionId },
            include: {
                options: true,
                scene: true
            }
        });
    },

    updateQuestion: async (
        questionId: string,
        questionData: UpdateQuestionData
    ): Promise<SceneQuery> => {
        if (!questionId?.trim()) {
            throw new Error('questionId is required');
        }

        if (Object.keys(questionData).length === 0) {
            throw new Error('No update data provided');
        }

        // Validate question exists
        const existingQuestion = await prisma.sceneQuery.findUnique({
            where: { id: questionId },
            select: { id: true, sceneId: true, queryNumber: true }
        });

        if (!existingQuestion) {
            throw new Error(`Question not found with id: ${questionId}`);
        }

        // If sceneId is being updated, validate new scene exists
        if (questionData.sceneId && questionData.sceneId !== existingQuestion.sceneId) {
            const newSceneExists = await prisma.levelScene.findUnique({
                where: { id: questionData.sceneId },
                select: { id: true }
            });

            if (!newSceneExists) {
                throw new Error(`Target scene not found with id: ${questionData.sceneId}`);
            }
        }

        // Perform update
        return await prisma.sceneQuery.update({
            where: { id: questionId },
            data: questionData
        });
    },

    deleteQuestion: async (questionId: string): Promise<SceneQuery> => {
        if (!questionId?.trim()) {
            throw new Error('questionId is required');
        }

        const existingQuestion = await prisma.sceneQuery.findUnique({
            where: { id: questionId },
            select: { id: true, sceneId: true, queryNumber: true }
        });

        if (!existingQuestion) {
            throw new Error(`Question not found with id: ${questionId}`);
        }

        const { sceneId, queryNumber } = existingQuestion;

        // Delete question and reorder remaining ones
        // delete option and reorder in a transaction
        const [optionsDeleted, deleted] = await prisma.$transaction([
            prisma.queryOption.deleteMany({ where: { queryId: questionId } }),
            prisma.sceneQuery.delete({ where: { id: questionId } }),
            prisma.sceneQuery.updateMany({
                where: {
                    sceneId,
                    queryNumber: { gt: queryNumber }
                },
                data: { queryNumber: { decrement: 1 } }
            })
        ]);

        return deleted;
    },

    getQuestionsBySceneId: async (sceneId: string): Promise<SceneQuery[]> => {
        if (!sceneId?.trim()) {
            throw new Error('sceneId is required');
        }

        return await prisma.sceneQuery.findMany({
            where: { sceneId },
            orderBy: { queryNumber: 'asc' },
            include: {
                options: true
            }
        });
    }
}

/*
// Question asked after a scene's media is viewed
model SceneQuery {
  id              String        @id @default(uuid())
  sceneId         String
  queryNumber     Int // Sequence of the question within the scene
  questionText    String        @db.Text
  learningOutcome String?       @db.Text // Key takeaway (e.g., "OTP kisi ko nahi dena chahiye")
  hintText        String?       @db.Text // Hint available on request
  options         QueryOption[]

  scene        LevelScene     @relation(fields: [sceneId], references: [id])
  UserResponse UserResponse[] // Linking user response to the specific query

  @@unique([sceneId, queryNumber])
}

// Options for a specific SceneQuery (Admin Uploaded)
model QueryOption {
  id            String  @id @default(uuid())
  queryId       String
  optionText    String
  isCorrect     Boolean @default(false)
  pointsAwarded Int     @default(0) // Points for selecting this option

  query SceneQuery @relation(fields: [queryId], references: [id])

  @@index([queryId])
}

*/