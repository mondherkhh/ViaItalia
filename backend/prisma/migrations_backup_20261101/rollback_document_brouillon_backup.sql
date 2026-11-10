-- Sauvegarde avant migration BROUILLON / submittedAt
CREATE TABLE IF NOT EXISTS `document_backup` LIKE `document`;
INSERT IGNORE INTO `document_backup` SELECT * FROM `document`;

-- Migration : ajouter submittedAt (nullable) et considérer BROUILLON comme valeur autorisée
ALTER TABLE `document` ADD COLUMN `submittedAt` datetime(3) DEFAULT NULL;

-- Mise à jour : tous les documents existants (ex. CV d'anis) considérés comme déjà envoyés
UPDATE `document` SET `submittedAt` = `createdAt`, `status` = 'PENDING' WHERE `submittedAt` IS NULL AND `status` IS NULL;
UPDATE `document` SET `submittedAt` = `createdAt` WHERE `submittedAt` IS NULL AND `status` = 'PENDING';
