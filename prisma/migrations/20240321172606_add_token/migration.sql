/*
  Warnings:

  - Added the required column `token` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "token" TEXT NOT NULL,
ALTER COLUMN "graduationYear" SET DEFAULT EXTRACT(YEAR FROM CURRENT_TIMESTAMP) + 4;
