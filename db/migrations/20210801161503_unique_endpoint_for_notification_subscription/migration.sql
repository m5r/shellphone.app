/*
  Warnings:

  - A unique constraint covering the columns `[endpoint]` on the table `NotificationSubscription` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "NotificationSubscription.endpoint_unique" ON "NotificationSubscription"("endpoint");
