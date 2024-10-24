
CREATE TABLE IF NOT EXISTS `api_key` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `keyvalue` varchar(50) NOT NULL,
  `description` mediumtext DEFAULT NULL,
  `validfrom` datetime NOT NULL,
  `validto` datetime NOT NULL,
  `usecase` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `keyvalue` (`keyvalue`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;

CREATE TABLE IF NOT EXISTS `candidate` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mail` varchar(255) NOT NULL,
  `distributionround` int(11) NOT NULL,
  `completed` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `offer` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `candidateid` int(11) NOT NULL,
  `voucherid` int(11) NOT NULL,
  `collectionpermit` char(128) NOT NULL,
  `created` datetime NOT NULL,
  `validto` datetime NOT NULL,
  `delivery` enum('OPEN','DELIVERED','TIMEOUT','REJECT') NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_candidateid` (`candidateid`),
  KEY `fk_voucherid` (`voucherid`),
  CONSTRAINT `fk_candidateid` FOREIGN KEY (`candidateid`) REFERENCES `candidate` (`id`),
  CONSTRAINT `fk_voucherid` FOREIGN KEY (`voucherid`) REFERENCES `voucher` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


CREATE TABLE IF NOT EXISTS `service_token` (
  `tokenvalue` char(128) NOT NULL,
  `created` datetime NOT NULL,
  `validto` datetime NOT NULL,
  `usecase` varchar(250) DEFAULT NULL,
  `comment` varchar(250) DEFAULT NULL,
  PRIMARY KEY (`tokenvalue`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci ROW_FORMAT=DYNAMIC;


CREATE TABLE IF NOT EXISTS `voucher` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `parent` int(11) DEFAULT NULL,
  `code` varchar(255) NOT NULL,
  `created` datetime NOT NULL,
  `used` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
