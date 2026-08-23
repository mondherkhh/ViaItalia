CREATE TABLE IF NOT EXISTS `AdmissionWindow` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `universityProgramId` INT NOT NULL,
  `label` VARCHAR(255) NULL,
  `callNumber` INT NULL,
  `placesType` VARCHAR(100) NULL,
  `openingDate` DATETIME(3) NULL,
  `closingDate` DATETIME(3) NULL,
  `applicationFee` VARCHAR(255) NULL,
  `sourceName` VARCHAR(255) NOT NULL,
  `sourceUrl` TEXT NOT NULL,
  `openingEvidence` JSON NULL,
  `closingEvidence` JSON NULL,
  `feeEvidence` JSON NULL,
  `verificationStatus` VARCHAR(191) NOT NULL DEFAULT 'NEEDS_REVIEW',
  `confidence` DOUBLE NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `AdmissionWindow_universityProgramId_idx` (`universityProgramId`),
  INDEX `AdmissionWindow_openingDate_idx` (`openingDate`),
  INDEX `AdmissionWindow_closingDate_idx` (`closingDate`),
  INDEX `AdmissionWindow_verificationStatus_idx` (`verificationStatus`),
  CONSTRAINT `AdmissionWindow_universityProgramId_fkey`
    FOREIGN KEY (`universityProgramId`) REFERENCES `UniversityProgram` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Keep legacy openingDate/closingDate/applicationFee populated by the existing
-- sync for older clients. New clients should read AdmissionWindow rows.
INSERT INTO `AdmissionWindow`
  (`universityProgramId`, `label`, `openingDate`, `closingDate`, `applicationFee`, `sourceName`, `sourceUrl`, `openingEvidence`, `closingEvidence`, `feeEvidence`, `verificationStatus`, `confidence`, `createdAt`, `updatedAt`)
SELECT
  `id`, 'Legacy selected window', `openingDate`, `closingDate`, `applicationFee`, `sourceName`, `sourceUrl`, `openingEvidence`, `closingEvidence`, `feeEvidence`, `verificationStatus`, `confidence`, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)
FROM `UniversityProgram` p
WHERE (`openingDate` IS NOT NULL OR `closingDate` IS NOT NULL OR `applicationFee` IS NOT NULL)
  AND NOT EXISTS (SELECT 1 FROM `AdmissionWindow` w WHERE w.`universityProgramId` = p.`id`);


-- Additional enrolment fee is distinct from applicationFee and tuition.
ALTER TABLE `UniversityProgram`
  ADD COLUMN IF NOT EXISTS `additionalEnrollmentFee` VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS `additionalEnrollmentFeeEvidence` JSON NULL;

UPDATE `UniversityProgram`
SET `additionalEnrollmentFee` = NULL,
    `additionalEnrollmentFeeEvidence` = NULL
WHERE `additionalEnrollmentFee` IS NULL;

COMMIT;

