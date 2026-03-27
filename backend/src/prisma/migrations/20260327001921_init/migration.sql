/*
  Warnings:

  - You are about to drop the column `lastReadAt` on the `room_members` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "room_members" DROP COLUMN "lastReadAt";
