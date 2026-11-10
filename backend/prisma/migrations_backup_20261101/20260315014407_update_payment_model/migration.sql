/*
  Warnings:

  - Added the required column `prixReste` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prixTotal` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `payment` ADD COLUMN `prixPaye` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `prixReste` DOUBLE NOT NULL,
    ADD COLUMN `prixTotal` DOUBLE NOT NULL;
