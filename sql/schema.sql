CREATE TABLE IF NOT EXISTS `vehicles` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `plate` CHAR(8) NOT NULL DEFAULT '',
  `vin` CHAR(17) NOT NULL,
  `owner` INT UNSIGNED NULL DEFAULT NULL,
  `group` VARCHAR(20) NULL DEFAULT NULL,
  `model` VARCHAR(20) NOT NULL,
  `class` TINYINT UNSIGNED NULL DEFAULT NULL,
  `data` JSON NOT NULL,
  `trunk` JSON NULL DEFAULT NULL,
  `glovebox` JSON NULL DEFAULT NULL,
  `stored` VARCHAR(50) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `plate` (`plate`),
  UNIQUE KEY `vin` (`vin`),
  KEY `vehicles_owner_key` (`owner`),
  CONSTRAINT `vehicles_owner_fk` FOREIGN KEY (`owner`) REFERENCES `characters` (`charId`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `vehicles_group_fk` FOREIGN KEY (`group`) REFERENCES `ox_groups` (`name`) ON DELETE CASCADE ON UPDATE CASCADE
);