-- CreateEnum
CREATE TYPE "PriceSource" AS ENUM ('POKEMONTCG', 'SCRYFALL', 'YGOPRODECK', 'PRICECHARTING');

-- CreateEnum
CREATE TYPE "PriceChangeStatus" AS ENUM ('APPLIED', 'PENDING', 'DISMISSED');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "autoPricing" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "costCents" INTEGER,
ADD COLUMN     "marketCents" INTEGER,
ADD COLUMN     "marketFetchedAt" TIMESTAMP(3),
ADD COLUMN     "priceSource" "PriceSource",
ADD COLUMN     "priceSourceId" TEXT;

-- CreateTable
CREATE TABLE "PriceChange" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "prevCents" INTEGER NOT NULL,
    "newCents" INTEGER NOT NULL,
    "marketCents" INTEGER,
    "note" TEXT NOT NULL DEFAULT '',
    "status" "PriceChangeStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriceChange_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PriceChange_status_createdAt_idx" ON "PriceChange"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "PriceChange" ADD CONSTRAINT "PriceChange_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
