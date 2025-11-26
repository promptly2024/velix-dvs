-- CreateEnum
CREATE TYPE "LevelType" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- AlterTable
ALTER TABLE "GameLevel" ADD COLUMN     "type" "LevelType" NOT NULL DEFAULT 'EASY';
