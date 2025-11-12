/*
  Warnings:

  - A unique constraint covering the columns `[userId,email]` on the table `DigitalFootprint` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "DigitalFootprint_userId_email_key" ON "DigitalFootprint"("userId", "email");
