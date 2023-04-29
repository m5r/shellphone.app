-- CreateEnum
CREATE TYPE "Direction" AS ENUM ('Inbound', 'Outbound');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('Queued', 'Sending', 'Sent', 'Failed', 'Delivered', 'Undelivered', 'Receiving', 'Received', 'Accepted', 'Scheduled', 'Read', 'PartiallyDelivered', 'Canceled', 'Error');

-- CreateEnum
CREATE TYPE "CallStatus" AS ENUM ('Queued', 'Ringing', 'InProgress', 'Completed', 'Busy', 'Failed', 'NoAnswer', 'Canceled');

-- CreateTable
CREATE TABLE "TwilioAccount" (
    "accountSid" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "authToken" TEXT NOT NULL,
    "twimlAppSid" TEXT,
    "apiKeySid" TEXT,
    "apiKeySecret" TEXT,

    CONSTRAINT "TwilioAccount_pkey" PRIMARY KEY ("accountSid")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "expiresAt" TIMESTAMPTZ(6),
    "data" TEXT NOT NULL,
    "twilioAccountSid" TEXT,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "sentAt" TIMESTAMPTZ(6) NOT NULL,
    "content" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
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
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recipient" TEXT NOT NULL,
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
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "number" TEXT NOT NULL,
    "isCurrent" BOOLEAN NOT NULL,
    "isFetchingMessages" BOOLEAN,
    "isFetchingCalls" BOOLEAN,
    "twilioAccountSid" TEXT NOT NULL,

    CONSTRAINT "PhoneNumber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationSubscription" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "endpoint" TEXT NOT NULL,
    "expirationTime" INTEGER,
    "keys_p256dh" TEXT NOT NULL,
    "keys_auth" TEXT NOT NULL,
    "twilioAccountSid" TEXT NOT NULL,

    CONSTRAINT "NotificationSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Message_phoneNumberId_recipient_idx" ON "Message"("phoneNumberId", "recipient");

-- CreateIndex
CREATE INDEX "PhoneCall_phoneNumberId_recipient_idx" ON "PhoneCall"("phoneNumberId", "recipient");

-- CreateIndex
CREATE UNIQUE INDEX "PhoneNumber_twilioAccountSid_isCurrent_key" ON "PhoneNumber"("twilioAccountSid", "isCurrent") WHERE ("isCurrent" = true);

-- CreateIndex
CREATE UNIQUE INDEX "NotificationSubscription_endpoint_key" ON "NotificationSubscription"("endpoint");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_twilioAccountSid_fkey" FOREIGN KEY ("twilioAccountSid") REFERENCES "TwilioAccount"("accountSid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_phoneNumberId_fkey" FOREIGN KEY ("phoneNumberId") REFERENCES "PhoneNumber"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhoneCall" ADD CONSTRAINT "PhoneCall_phoneNumberId_fkey" FOREIGN KEY ("phoneNumberId") REFERENCES "PhoneNumber"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhoneNumber" ADD CONSTRAINT "PhoneNumber_twilioAccountSid_fkey" FOREIGN KEY ("twilioAccountSid") REFERENCES "TwilioAccount"("accountSid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationSubscription" ADD CONSTRAINT "NotificationSubscription_twilioAccountSid_fkey" FOREIGN KEY ("twilioAccountSid") REFERENCES "TwilioAccount"("accountSid") ON DELETE CASCADE ON UPDATE CASCADE;
