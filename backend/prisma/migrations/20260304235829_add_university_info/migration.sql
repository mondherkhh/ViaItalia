-- CreateTable
CREATE TABLE `UniversityInfo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `university` VARCHAR(191) NOT NULL,
    `specialty` VARCHAR(191) NOT NULL,
    `level` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UniversityInfo` ADD CONSTRAINT `UniversityInfo_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
