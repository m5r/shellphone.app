/*
  Warnings:

  - You are about to drop the column `slug` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `stripeCurrentPeriodEnd` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `stripeCustomerId` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `stripePriceId` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `stripeSubscriptionId` on the `Organization` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('active', 'trialing', 'past_due', 'paused', 'deleted');

-- CreateEnum
CREATE TYPE "Direction" AS ENUM ('Inbound', 'Outbound');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('Queued', 'Sending', 'Sent', 'Failed', 'Delivered', 'Undelivered', 'Receiving', 'Received', 'Accepted', 'Scheduled', 'Read', 'PartiallyDelivered', 'Canceled', 'Error');

-- CreateEnum
CREATE TYPE "CallStatus" AS ENUM ('Queued', 'Ringing', 'InProgress', 'Completed', 'Busy', 'Failed', 'NoAnswer', 'Canceled');

-- DropIndex
DROP INDEX "Organization_slug_key";

-- DropIndex
DROP INDEX "Organization_stripeCustomerId_key";

-- DropIndex
DROP INDEX "Organization_stripeSubscriptionId_key";

-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "slug",
DROP COLUMN "stripeCurrentPeriodEnd",
DROP COLUMN "stripeCustomerId",
DROP COLUMN "stripePriceId",
DROP COLUMN "stripeSubscriptionId";

-- CreateTable
CREATE TABLE "Subscription" (
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "paddleSubscriptionId" INTEGER NOT NULL,
    "paddlePlanId" INTEGER NOT NULL,
    "paddleCheckoutId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL,
    "updateUrl" TEXT NOT NULL,
    "cancelUrl" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "nextBillDate" DATE NOT NULL,
    "lastEventTime" TIMESTAMP NOT NULL,
    "cancellationEffectiveDate" DATE,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("paddleSubscriptionId")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "sentAt" TIMESTAMPTZ NOT NULL,
    "content" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "direction" "Direction" NOT NULL,
    "status" "MessageStatus" NOT NULL,
    "phoneNumberId" TEXT NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhoneCall" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "status" "CallStatus" NOT NULL,
    "direction" "Direction" NOT NULL,
    "duration" TEXT NOT NULL,
    "phoneNumberId" TEXT NOT NULL,

    CONSTRAINT "PhoneCall_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhoneNumber" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "number" TEXT NOT NULL,
    "hasFetchedMessages" BOOLEAN,
    "hasFetchedCalls" BOOLEAN,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "PhoneNumber_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_paddleSubscriptionId_key" ON "Subscription"("paddleSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "PhoneNumber_organizationId_id_key" ON "PhoneNumber"("organizationId", "id");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_phoneNumberId_fkey" FOREIGN KEY ("phoneNumberId") REFERENCES "PhoneNumber"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhoneCall" ADD CONSTRAINT "PhoneCall_phoneNumberId_fkey" FOREIGN KEY ("phoneNumberId") REFERENCES "PhoneNumber"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhoneNumber" ADD CONSTRAINT "PhoneNumber_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
