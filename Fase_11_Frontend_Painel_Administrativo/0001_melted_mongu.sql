CREATE TABLE `admin_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`adminId` int NOT NULL,
	`action` varchar(128) NOT NULL,
	`entityType` varchar(64),
	`entityId` int,
	`details` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `admin_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `commission_configs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`level` int NOT NULL,
	`percentage` decimal(5,2) NOT NULL,
	`minAmount` decimal(15,2) DEFAULT '0',
	`description` text,
	`active` int DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `commission_configs_id` PRIMARY KEY(`id`),
	CONSTRAINT `commission_configs_level_unique` UNIQUE(`level`)
);
--> statement-breakpoint
CREATE TABLE `delinquents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`affiliateId` int NOT NULL,
	`outstandingAmount` decimal(15,2) NOT NULL,
	`daysOverdue` int DEFAULT 0,
	`status` enum('active','resolved','disputed') NOT NULL DEFAULT 'active',
	`reason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`resolvedAt` timestamp,
	CONSTRAINT `delinquents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `material_downloads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`materialId` int NOT NULL,
	`affiliateId` int,
	`downloadedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `material_downloads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `materials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(256) NOT NULL,
	`description` text,
	`category` varchar(64) NOT NULL,
	`type` enum('banner','text','link','video','image','document') NOT NULL,
	`url` text,
	`fileKey` varchar(256),
	`downloadCount` int DEFAULT 0,
	`status` enum('active','inactive','archived') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `materials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`affiliateId` int NOT NULL,
	`amount` decimal(15,2) NOT NULL,
	`status` enum('pending','approved','paid','rejected','cancelled') NOT NULL DEFAULT 'pending',
	`paymentMethod` varchar(64),
	`transactionId` varchar(128),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`paidAt` timestamp,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
