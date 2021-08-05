/*
  Warnings:

  - You are about to drop the column `customerId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `twilioSid` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `customerId` on the `NotificationSubscription` table. All the data in the column will be lost.
  - You are about to drop the column `customerId` on the `PhoneCall` table. All the data in the column will be lost.
  - You are about to drop the column `twilioSid` on the `PhoneCall` table. All the data in the column will be lost.
  - You are about to drop the column `customerId` on the `PhoneNumber` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `PhoneNumber` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumberSid` on the `PhoneNumber` table. All the data in the column will be lost.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `Customer` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[phoneNumberId,id]` on the table `Message` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phoneNumberId,id]` on the table `PhoneCall` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[organizationId,id]` on the table `PhoneNumber` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `phoneNumberId` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `NotificationSubscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneNumberId` to the `NotificationSubscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneNumberId` to the `PhoneCall` table without a default value. This is not possible if the table is not empty.
  - Added the required column `number` to the `PhoneNumber` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `PhoneNumber` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MembershipRole" AS ENUM ('OWNER', 'ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "GlobalRole" AS ENUM ('SUPERADMIN', 'CUSTOMER');

-- AlterEnum
ALTER TYPE "MessageStatus" ADD VALUE 'Error';

-- DropForeignKey
ALTER TABLE "Customer" DROP CONSTRAINT "Customer_id_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_customerId_fkey";

-- DropForeignKey
ALTER TABLE "NotificationSubscription" DROP CONSTRAINT "NotificationSubscription_customerId_fkey";

-- DropForeignKey
ALTER TABLE "PhoneCall" DROP CONSTRAINT "PhoneCall_customerId_fkey";

-- DropForeignKey
ALTER TABLE "PhoneNumber" DROP CONSTRAINT "PhoneNumber_customerId_fkey";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "customerId",
DROP COLUMN "twilioSid",
ADD COLUMN     "phoneNumberId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "NotificationSubscription" DROP COLUMN "customerId",
ADD COLUMN     "organizationId" TEXT NOT NULL,
ADD COLUMN     "phoneNumberId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PhoneCall" DROP COLUMN "customerId",
DROP COLUMN "twilioSid",
ADD COLUMN     "phoneNumberId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PhoneNumber" DROP COLUMN "customerId",
DROP COLUMN "phoneNumber",
DROP COLUMN "phoneNumberSid",
ADD COLUMN     "number" TEXT NOT NULL,
ADD COLUMN     "organizationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "role" "GlobalRole" NOT NULL DEFAULT E'CUSTOMER';

-- DropTable
DROP TABLE "Customer";

-- CreateTable
CREATE TABLE "TwilioCredentials" (
    "accountSid" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "authToken" TEXT NOT NULL,
    "twimlAppSid" TEXT,
    "organizationId" TEXT NOT NULL,

    PRIMARY KEY ("accountSid")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "encryptionKey" TEXT NOT NULL,
    "paddleCustomerId" TEXT,
    "paddleSubscriptionId" TEXT,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Membership" (
    "id" TEXT NOT NULL,
    "role" "MembershipRole" NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT,
    "invitedName" TEXT,
    "invitedEmail" TEXT,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Membership.organizationId_invitedEmail_unique" ON "Membership"("organizationId", "invitedEmail");

-- CreateIndex
CREATE UNIQUE INDEX "Message.phoneNumberId_id_unique" ON "Message"("phoneNumberId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "PhoneCall.phoneNumberId_id_unique" ON "PhoneCall"("phoneNumberId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "PhoneNumber.organizationId_id_unique" ON "PhoneNumber"("organizationId", "id");

-- AddForeignKey
ALTER TABLE "TwilioCredentials" ADD FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD FOREIGN KEY ("phoneNumberId") REFERENCES "PhoneNumber"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhoneCall" ADD FOREIGN KEY ("phoneNumberId") REFERENCES "PhoneNumber"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhoneNumber" ADD FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationSubscription" ADD FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationSubscription" ADD FOREIGN KEY ("phoneNumberId") REFERENCES "PhoneNumber"("id") ON DELETE CASCADE ON UPDATE CASCADE;
