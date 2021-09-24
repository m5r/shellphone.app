-- CreateTable
CREATE TABLE "ProcessingPhoneNumber" (
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hasFetchedMessages" BOOLEAN NOT NULL,
    "hasFetchedCalls" BOOLEAN NOT NULL,
    "phoneNumberId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,

    PRIMARY KEY ("organizationId","phoneNumberId")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProcessingPhoneNumber_phoneNumberId_unique" ON "ProcessingPhoneNumber"("phoneNumberId");

-- AddForeignKey
ALTER TABLE "ProcessingPhoneNumber" ADD FOREIGN KEY ("phoneNumberId") REFERENCES "PhoneNumber"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessingPhoneNumber" ADD FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
