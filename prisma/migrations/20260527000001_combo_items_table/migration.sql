-- CreateTable: ComboItem reemplaza comboItem1Id/comboItem2Id con una relación 1-N extensible
CREATE TABLE "ComboItem" (
    "id" TEXT NOT NULL,
    "comboId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,

    CONSTRAINT "ComboItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ComboItem" ADD CONSTRAINT "ComboItem_comboId_fkey"
    FOREIGN KEY ("comboId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ComboItem" ADD CONSTRAINT "ComboItem_itemId_fkey"
    FOREIGN KEY ("itemId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Migrar datos existentes de comboItem1Id/2Id a la nueva tabla
INSERT INTO "ComboItem" ("id", "comboId", "itemId")
    SELECT gen_random_uuid()::text, id, "comboItem1Id"
    FROM "Product" WHERE "comboItem1Id" IS NOT NULL;

INSERT INTO "ComboItem" ("id", "comboId", "itemId")
    SELECT gen_random_uuid()::text, id, "comboItem2Id"
    FROM "Product" WHERE "comboItem2Id" IS NOT NULL;

-- Eliminar columnas antiguas
ALTER TABLE "Product" DROP COLUMN "comboItem1Id";
ALTER TABLE "Product" DROP COLUMN "comboItem2Id";
