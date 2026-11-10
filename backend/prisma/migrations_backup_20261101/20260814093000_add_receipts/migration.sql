CREATE TABLE `Receipt` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `receiptNumber` VARCHAR(191) NOT NULL,
  `amount` DOUBLE NOT NULL,
  `paymentMethod` ENUM('ESPECE','VIREMENT') NOT NULL,
  `paymentDate` DATETIME(3) NOT NULL,
  `userId` INT NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `Receipt_receiptNumber_key` (`receiptNumber`),
  INDEX `Receipt_userId_idx` (`userId`),
  INDEX `Receipt_paymentDate_idx` (`paymentDate`),
  PRIMARY KEY (`id`),
  CONSTRAINT `Receipt_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
