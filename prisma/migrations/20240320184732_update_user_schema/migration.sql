/*
  Warnings:

  - You are about to drop the column `userId` on the `Socials` table. All the data in the column will be lost.
  - The `graduationYear` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_socialsId_fkey";

-- AlterTable
ALTER TABLE "Socials" DROP COLUMN "userId",
ALTER COLUMN "facebook" DROP NOT NULL,
ALTER COLUMN "instagram" DROP NOT NULL,
ALTER COLUMN "linkedin" DROP NOT NULL,
ALTER COLUMN "github" DROP NOT NULL,
ALTER COLUMN "twitter" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "name" SET DEFAULT '',
ALTER COLUMN "branch" SET DEFAULT '',
DROP COLUMN "graduationYear",
ADD COLUMN     "graduationYear" INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_TIMESTAMP) + 4,
ALTER COLUMN "photo" DROP NOT NULL,
ALTER COLUMN "socialsId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_socialsId_fkey" FOREIGN KEY ("socialsId") REFERENCES "Socials"("id") ON DELETE SET NULL ON UPDATE CASCADE;
