-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "comboItem1Id" TEXT,
ADD COLUMN     "comboItem2Id" TEXT;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_comboItem1Id_fkey" FOREIGN KEY ("comboItem1Id") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_comboItem2Id_fkey" FOREIGN KEY ("comboItem2Id") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
