/*
  Warnings:

  - Made the column `organizationId` on table `Subscription` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Subscription_organizationId_unique";

-- AlterTable
ALTER TABLE "Subscription" ALTER COLUMN "organizationId" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "fullName" DROP DEFAULT;
