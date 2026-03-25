-- CreateEnum
CREATE TYPE "EventCategory" AS ENUM ('concert', 'conference', 'festival', 'sport', 'theatre', 'exposition', 'autre');

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "category" "EventCategory" NOT NULL DEFAULT 'autre';

-- CreateIndex
CREATE INDEX "events_category_idx" ON "events"("category");
