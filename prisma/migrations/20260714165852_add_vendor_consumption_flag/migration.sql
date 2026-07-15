-- AlterTable: agrega la marca para permitir "ingresar consumo" a un vendedor.
-- Migración aditiva: solo añade una columna con default false, no toca datos existentes.
ALTER TABLE "User" ADD COLUMN "canEnterConsumption" BOOLEAN NOT NULL DEFAULT false;
