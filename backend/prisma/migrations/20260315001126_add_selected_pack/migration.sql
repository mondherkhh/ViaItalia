-- CreateTable
CREATE TABLE `study_in_italy_forms` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fullName` VARCHAR(191) NOT NULL,
    `phoneNumber` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `passportStatus` VARCHAR(191) NOT NULL,
    `currentLevel` VARCHAR(191) NOT NULL,
    `desiredLevel` VARCHAR(191) NOT NULL,
    `studyLanguage` VARCHAR(191) NOT NULL,
    `desiredSpecialty` VARCHAR(191) NOT NULL,
    `age` INTEGER NOT NULL,
    `selectedPack` VARCHAR(191) NOT NULL,
    `submissionDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
