/*
  Warnings:

  - You are about to drop the `TwilioCredentials` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TwilioCredentials" DROP CONSTRAINT "TwilioCredentials_organizationId_fkey";

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "twilioAccountSid" TEXT,
ADD COLUMN     "twilioAuthToken" TEXT,
ADD COLUMN     "twimlAppSid" TEXT;

-- DropTable
DROP TABLE "TwilioCredentials";
