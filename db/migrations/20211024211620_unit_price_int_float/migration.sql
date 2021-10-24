-- AlterTable
ALTER TABLE "Subscription" ALTER COLUMN "unitPrice" SET DATA TYPE DOUBLE PRECISION;

-- RenameIndex
ALTER INDEX "ProcessingPhoneNumber_phoneNumberId_unique" RENAME TO "ProcessingPhoneNumber_phoneNumberId_key";
