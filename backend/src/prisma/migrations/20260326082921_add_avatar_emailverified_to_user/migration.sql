-- AlterTable
ALTER TABLE "users" ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT true;
