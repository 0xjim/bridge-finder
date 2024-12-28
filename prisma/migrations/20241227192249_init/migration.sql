/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Bridge` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Bridge` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Network` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Network` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Bridge_bridgeName_idx";

-- DropIndex
DROP INDEX "BridgeRequest_requestId_idx";

-- DropIndex
DROP INDEX "Network_networkName_idx";

-- AlterTable
ALTER TABLE "Bridge" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "BridgeRequest" ALTER COLUMN "status" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Network" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";
