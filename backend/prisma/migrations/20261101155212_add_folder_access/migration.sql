-- CreateFolderAccess
CREATE TABLE IF NOT EXISTS `folderaccess` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `folder` varchar(255) NOT NULL,
  `allowed` tinyint(1) NOT NULL DEFAULT 0,
  `updatedById` int DEFAULT NULL,
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `folderaccess_userId_folder_key` (`userId`,`folder`),
  KEY `folderaccess_userId_idx` (`userId`),
  KEY `folderaccess_folder_idx` (`folder`),
  CONSTRAINT `folderaccess_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
