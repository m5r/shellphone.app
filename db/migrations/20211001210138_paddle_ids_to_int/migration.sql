/*
  Warnings:

  - The primary key for the `Subscription` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[paddleSubscriptionId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `paddleSubscriptionId` on the `Subscription` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `paddlePlanId` on the `Subscription` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `unitPrice` on the `Subscription` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_pkey",
DROP COLUMN "paddleSubscriptionId",
ADD COLUMN     "paddleSubscriptionId" INTEGER NOT NULL,
DROP COLUMN "paddlePlanId",
ADD COLUMN     "paddlePlanId" INTEGER NOT NULL,
DROP COLUMN "unitPrice",
ADD COLUMN     "unitPrice" INTEGER NOT NULL,
ADD CONSTRAINT "Subscription_pkey" PRIMARY KEY ("paddleSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_paddleSubscriptionId_key" ON "Subscription"("paddleSubscriptionId");
