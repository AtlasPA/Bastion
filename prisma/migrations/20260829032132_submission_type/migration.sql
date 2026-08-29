-- CreateEnum
CREATE TYPE "SubmissionType" AS ENUM ('OFFER', 'REPAIR');

-- AlterTable
ALTER TABLE "OfferSubmission" ADD COLUMN     "type" "SubmissionType" NOT NULL DEFAULT 'OFFER';
