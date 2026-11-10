/*
  Warnings:

  - You are about to drop the column `studyType` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `university` on the `user` table. All the data in the column will be lost.

*/

-- Step 1: Update NULL passport values to temporary values
UPDATE `user` SET `passport` = 'TEMP_PASSPORT' WHERE `passport` IS NULL;

-- Step 2: Add new columns with default values
ALTER TABLE `user` 
    ADD COLUMN `address` VARCHAR(191) NOT NULL DEFAULT 'Adresse non spécifiée',
    ADD COLUMN `image` VARCHAR(191) NULL,
    ADD COLUMN `phoneNumber` VARCHAR(191) NOT NULL DEFAULT '0000000000';

-- Step 3: Drop old columns
ALTER TABLE `user` 
    DROP COLUMN `studyType`,
    DROP COLUMN `university`;

-- Step 4: Make passport required (now no NULL values exist)
ALTER TABLE `user` MODIFY `passport` VARCHAR(191) NOT NULL;
