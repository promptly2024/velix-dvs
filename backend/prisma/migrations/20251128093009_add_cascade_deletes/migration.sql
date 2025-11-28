-- DropForeignKey
ALTER TABLE "public"."LevelScene" DROP CONSTRAINT "LevelScene_levelId_fkey";

-- DropForeignKey
ALTER TABLE "public"."QueryOption" DROP CONSTRAINT "QueryOption_queryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SceneQuery" DROP CONSTRAINT "SceneQuery_sceneId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserLevelAttempt" DROP CONSTRAINT "UserLevelAttempt_levelId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserLevelAttempt" DROP CONSTRAINT "UserLevelAttempt_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserResponse" DROP CONSTRAINT "UserResponse_attemptId_fkey";

-- AddForeignKey
ALTER TABLE "LevelScene" ADD CONSTRAINT "LevelScene_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "GameLevel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SceneQuery" ADD CONSTRAINT "SceneQuery_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "LevelScene"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QueryOption" ADD CONSTRAINT "QueryOption_queryId_fkey" FOREIGN KEY ("queryId") REFERENCES "SceneQuery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLevelAttempt" ADD CONSTRAINT "UserLevelAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLevelAttempt" ADD CONSTRAINT "UserLevelAttempt_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "GameLevel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserResponse" ADD CONSTRAINT "UserResponse_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "UserLevelAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
