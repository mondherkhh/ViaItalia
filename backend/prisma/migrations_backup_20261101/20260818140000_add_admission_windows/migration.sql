CREATE TABLE IF NOT EXISTS `AdmissionWindow` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `universityProgramId` INT NOT NULL,
  `label` VARCHAR(191) NULL,
  `callNumber` INT NULL,
  `placesType` VARCHAR(191) NULL,
  `openingDate` DATETIME(3) NULL,
  `closingDate` DATETIME(3) NULL,
  `applicationFee` VARCHAR(191) NULL,
  `sourceName` VARCHAR(191) NOT NULL,
  `sourceUrl` TEXT NOT NULL,
  `openingEvidence` JSON NULL,
  `closingEvidence` JSON NULL,
  `feeEvidence` JSON NULL,
  `verificationStatus` VARCHAR(191) NOT NULL DEFAULT 'NEEDS_REVIEW',
  `confidence` DOUBLE NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  INDEX `AdmissionWindow_universityProgramId_idx` (`universityProgramId`),
  INDEX `AdmissionWindow_openingDate_idx` (`openingDate`),
  INDEX `AdmissionWindow_closingDate_idx` (`closingDate`),
  INDEX `AdmissionWindow_verificationStatus_idx` (`verificationStatus`),
  PRIMARY KEY (`id`),
  CONSTRAINT `AdmissionWindow_universityProgramId_fkey`
    FOREIGN KEY (`universityProgramId`) REFERENCES `UniversityProgram` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `AdmissionWindow`
  (`universityProgramId`, `label`, `openingDate`, `closingDate`, `applicationFee`, `sourceName`, `sourceUrl`, `openingEvidence`, `closingEvidence`, `feeEvidence`, `verificationStatus`, `confidence`, `createdAt`, `updatedAt`)
SELECT
  p.`id`, 'Legacy imported window', p.`openingDate`, p.`closingDate`, p.`applicationFee`, p.`sourceName`, p.`sourceUrl`, p.`openingEvidence`, p.`closingEvidence`, p.`feeEvidence`, p.`verificationStatus`, p.`confidence`, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)
FROM `UniversityProgram` p
WHERE NOT EXISTS (
  SELECT 1 FROM `AdmissionWindow` w WHERE w.`universityProgramId` = p.`id`
)
AND (p.`openingDate` IS NOT NULL OR p.`closingDate` IS NOT NULL OR p.`applicationFee` IS NOT NULL);
