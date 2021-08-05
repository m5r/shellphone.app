/*
  Warnings:

  - A unique constraint covering the columns `[organizationId,phoneNumberId,id]` on the table `Message` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,twilioAccountSid]` on the table `Organization` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[organizationId,phoneNumberId,id]` on the table `PhoneCall` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `organizationId` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `PhoneCall` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Message.phoneNumberId_id_unique";

-- DropIndex
DROP INDEX "PhoneCall.phoneNumberId_id_unique";

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "organizationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PhoneCall" ADD COLUMN     "organizationId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Message.organizationId_phoneNumberId_id_unique" ON "Message"("organizationId", "phoneNumberId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "Organization.id_twilioAccountSid_unique" ON "Organization"("id", "twilioAccountSid");

-- CreateIndex
CREATE UNIQUE INDEX "PhoneCall.organizationId_phoneNumberId_id_unique" ON "PhoneCall"("organizationId", "phoneNumberId", "id");

-- AddForeignKey
ALTER TABLE "Message" ADD FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhoneCall" ADD FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
