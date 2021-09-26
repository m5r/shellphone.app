/*
  Warnings:

  - You are about to drop the column `paddleCustomerId` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `paddleSubscriptionId` on the `Organization` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('active', 'trialing', 'past_due', 'paused', 'deleted');

-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "paddleCustomerId",
DROP COLUMN "paddleSubscriptionId";

-- CreateTable
CREATE TABLE "Subscription" (
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "paddleSubscriptionId" TEXT NOT NULL,
    "paddlePlanId" TEXT NOT NULL,
    "paddleCheckoutId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL,
    "updateUrl" TEXT NOT NULL,
    "cancelUrl" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "unitPrice" TEXT NOT NULL,
    "nextBillDate" DATE NOT NULL,
    "lastEventTime" TIMESTAMP NOT NULL,
    "organizationId" TEXT,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("paddleSubscriptionId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_paddleSubscriptionId_key" ON "Subscription"("paddleSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_organizationId_unique" ON "Subscription"("organizationId");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
