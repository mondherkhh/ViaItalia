-- Migration : ajouter submittedAt au Document (nullable). BROUILLON = valeur de status.
ALTER TABLE `document` ADD COLUMN `submittedAt` datetime(3) DEFAULT NULL;

-- Documents existants (CV d'anis etc.) = déjà envoyés : submittedAt = createdAt, status conservé (PENDING / etc.)
UPDATE `document` SET `submittedAt` = `createdAt` WHERE `submittedAt` IS NULL;
