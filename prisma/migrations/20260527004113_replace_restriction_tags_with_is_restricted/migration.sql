/*
  Warnings:

  - You are about to drop the column `restrictionTags` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `stock` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "restrictionTags",
DROP COLUMN "stock",
ADD COLUMN     "isRestricted" BOOLEAN NOT NULL DEFAULT false;
