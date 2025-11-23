-- CreateEnum
CREATE TYPE "SceneMediaType" AS ENUM ('VIDEO', 'IMAGES', 'TEXT');

-- CreateTable
CREATE TABLE "GameLevel" (
    "id" TEXT NOT NULL,
    "levelNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "requiredScore" INTEGER NOT NULL,
    "basePoints" INTEGER NOT NULL,

    CONSTRAINT "GameLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LevelScene" (
    "id" TEXT NOT NULL,
    "levelId" TEXT NOT NULL,
    "sceneNumber" INTEGER NOT NULL,
    "sceneType" "SceneMediaType" NOT NULL DEFAULT 'VIDEO',
    "mediaUrls" TEXT[],

    CONSTRAINT "LevelScene_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SceneQuery" (
    "id" TEXT NOT NULL,
    "sceneId" TEXT NOT NULL,
    "queryNumber" INTEGER NOT NULL,
    "questionText" TEXT NOT NULL,
    "learningOutcome" TEXT,
    "hintText" TEXT,

    CONSTRAINT "SceneQuery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QueryOption" (
    "id" TEXT NOT NULL,
    "queryId" TEXT NOT NULL,
    "optionText" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "pointsAwarded" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "QueryOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLevelAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "levelId" TEXT NOT NULL,
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "isPassed" BOOLEAN NOT NULL DEFAULT false,
    "scoreAchieved" INTEGER NOT NULL DEFAULT 0,
    "currentSceneNumber" INTEGER NOT NULL DEFAULT 1,
    "currentQueryNumber" INTEGER NOT NULL DEFAULT 1,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "UserLevelAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserResponse" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "queryId" TEXT NOT NULL,
    "selectedOptionId" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "pointsEarned" INTEGER NOT NULL,
    "isFirstTry" BOOLEAN NOT NULL DEFAULT true,
    "respondedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserResponse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GameLevel_levelNumber_key" ON "GameLevel"("levelNumber");

-- CreateIndex
CREATE INDEX "GameLevel_levelNumber_idx" ON "GameLevel"("levelNumber");

-- CreateIndex
CREATE UNIQUE INDEX "LevelScene_levelId_sceneNumber_key" ON "LevelScene"("levelId", "sceneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "SceneQuery_sceneId_queryNumber_key" ON "SceneQuery"("sceneId", "queryNumber");

-- CreateIndex
CREATE INDEX "QueryOption_queryId_idx" ON "QueryOption"("queryId");

-- CreateIndex
CREATE INDEX "UserLevelAttempt_userId_levelId_idx" ON "UserLevelAttempt"("userId", "levelId");

-- CreateIndex
CREATE UNIQUE INDEX "UserLevelAttempt_userId_levelId_attemptNumber_key" ON "UserLevelAttempt"("userId", "levelId", "attemptNumber");

-- CreateIndex
CREATE UNIQUE INDEX "UserResponse_attemptId_queryId_key" ON "UserResponse"("attemptId", "queryId");

-- AddForeignKey
ALTER TABLE "LevelScene" ADD CONSTRAINT "LevelScene_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "GameLevel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SceneQuery" ADD CONSTRAINT "SceneQuery_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "LevelScene"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QueryOption" ADD CONSTRAINT "QueryOption_queryId_fkey" FOREIGN KEY ("queryId") REFERENCES "SceneQuery"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLevelAttempt" ADD CONSTRAINT "UserLevelAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLevelAttempt" ADD CONSTRAINT "UserLevelAttempt_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "GameLevel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserResponse" ADD CONSTRAINT "UserResponse_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "UserLevelAttempt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserResponse" ADD CONSTRAINT "UserResponse_queryId_fkey" FOREIGN KEY ("queryId") REFERENCES "SceneQuery"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
