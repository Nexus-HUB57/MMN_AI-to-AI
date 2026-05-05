CREATE TABLE `affiliates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`affiliateCode` varchar(32) NOT NULL,
	`sponsorId` int,
	`commissionPercentage` int NOT NULL DEFAULT 10,
	`status` enum('active','inactive','suspended') NOT NULL DEFAULT 'active',
	`totalCommissions` decimal(15,2) NOT NULL DEFAULT '0.00',
	`pendingCommissions` decimal(15,2) NOT NULL DEFAULT '0.00',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `affiliates_id` PRIMARY KEY(`id`),
	CONSTRAINT `affiliates_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `affiliates_affiliateCode_unique` UNIQUE(`affiliateCode`)
);
--> statement-breakpoint
CREATE TABLE `agent_upgrades` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` int NOT NULL,
	`upgradeId` int NOT NULL,
	`status` enum('active','inactive','expired') NOT NULL DEFAULT 'active',
	`activatedAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	CONSTRAINT `agent_upgrades_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` text NOT NULL,
	`status` enum('learning','active','paused','inactive') NOT NULL DEFAULT 'learning',
	`contentStrategy` text,
	`performanceScore` int NOT NULL DEFAULT 0,
	`totalSales` decimal(15,2) NOT NULL DEFAULT '0.00',
	`totalCommissions` decimal(15,2) NOT NULL DEFAULT '0.00',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agents_id` PRIMARY KEY(`id`),
	CONSTRAINT `agents_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `commissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`affiliateId` int NOT NULL,
	`amount` decimal(15,2) NOT NULL,
	`level` int NOT NULL,
	`source` varchar(64) NOT NULL,
	`sourceId` int,
	`status` enum('pending','confirmed','paid','cancelled') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `commissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `network` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sponsorId` int NOT NULL,
	`level` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `network_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `upgrades` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(128) NOT NULL,
	`description` text,
	`price` decimal(15,2) NOT NULL,
	`category` varchar(64) NOT NULL,
	`status` enum('available','discontinued') NOT NULL DEFAULT 'available',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `upgrades_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `affiliates_userId_idx` ON `affiliates` (`userId`);--> statement-breakpoint
CREATE INDEX `affiliates_sponsorId_idx` ON `affiliates` (`sponsorId`);--> statement-breakpoint
CREATE INDEX `agent_upgrades_agentId_idx` ON `agent_upgrades` (`agentId`);--> statement-breakpoint
CREATE INDEX `agent_upgrades_upgradeId_idx` ON `agent_upgrades` (`upgradeId`);--> statement-breakpoint
CREATE INDEX `agents_userId_idx` ON `agents` (`userId`);--> statement-breakpoint
CREATE INDEX `commissions_affiliateId_idx` ON `commissions` (`affiliateId`);--> statement-breakpoint
CREATE INDEX `commissions_status_idx` ON `commissions` (`status`);--> statement-breakpoint
CREATE INDEX `network_userId_idx` ON `network` (`userId`);--> statement-breakpoint
CREATE INDEX `network_sponsorId_idx` ON `network` (`sponsorId`);--> statement-breakpoint
CREATE INDEX `upgrades_status_idx` ON `upgrades` (`status`);