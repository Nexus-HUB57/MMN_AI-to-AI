CREATE TABLE `affiliates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sponsorId` int,
	`affiliateCode` varchar(32) NOT NULL,
	`status` enum('active','inactive','suspended') NOT NULL DEFAULT 'active',
	`commissionPercentage` decimal(5,2) DEFAULT '10.00',
	`totalEarnings` decimal(15,2) DEFAULT '0.00',
	`totalCommissions` decimal(15,2) DEFAULT '0.00',
	`directReferrals` int DEFAULT 0,
	`totalNetworkSize` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `affiliates_id` PRIMARY KEY(`id`),
	CONSTRAINT `affiliates_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `affiliates_affiliateCode_unique` UNIQUE(`affiliateCode`)
);
--> statement-breakpoint
CREATE TABLE `agentUpgrades` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` int NOT NULL,
	`upgradeId` int NOT NULL,
	`status` enum('active','inactive','expired') NOT NULL DEFAULT 'active',
	`activatedAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	CONSTRAINT `agentUpgrades_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(100),
	`status` enum('active','inactive','learning') NOT NULL DEFAULT 'active',
	`contentStrategy` text,
	`budget` decimal(15,2) DEFAULT '0.00',
	`budgetSpent` decimal(15,2) DEFAULT '0.00',
	`lastContentGenerated` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agents_id` PRIMARY KEY(`id`),
	CONSTRAINT `agents_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `commissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`affiliateId` int NOT NULL,
	`orderId` int,
	`level` int NOT NULL,
	`amount` decimal(15,2) NOT NULL,
	`type` enum('direct_sale','network','bonus','adjustment') NOT NULL DEFAULT 'network',
	`status` enum('pending','approved','paid') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`paidAt` timestamp,
	CONSTRAINT `commissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `network` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sponsorId` int NOT NULL,
	`level` int NOT NULL,
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `network_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`affiliateId` int NOT NULL,
	`productId` int NOT NULL,
	`externalOrderId` varchar(100),
	`customerEmail` varchar(320),
	`amount` decimal(15,2) NOT NULL,
	`commission` decimal(15,2) NOT NULL,
	`status` enum('pending','confirmed','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`confirmedAt` timestamp,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`affiliateId` int NOT NULL,
	`amount` decimal(15,2) NOT NULL,
	`method` enum('bank_transfer','pix','boleto','credit_card','paypal') NOT NULL,
	`status` enum('pending','confirmed','failed') NOT NULL DEFAULT 'pending',
	`reference` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`confirmedAt` timestamp,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`externalId` varchar(100) NOT NULL,
	`marketplace` enum('mercado_livre','shopee','hotmart') NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`price` decimal(15,2) NOT NULL,
	`commissionPercentage` decimal(5,2) NOT NULL,
	`category` varchar(100),
	`trend` enum('rising','stable','declining') DEFAULT 'stable',
	`imageUrl` text,
	`affiliateUrl` text,
	`syncedAt` timestamp DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `upgrades` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`type` enum('content_generation','analytics','automation','integration','advanced') NOT NULL,
	`price` decimal(15,2) DEFAULT '0.00',
	`features` text,
	`status` enum('available','beta','deprecated') NOT NULL DEFAULT 'available',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `upgrades_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','leader','supervisor','affiliate') NOT NULL DEFAULT 'affiliate';