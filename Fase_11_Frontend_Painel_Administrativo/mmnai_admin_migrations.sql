-- Fase 11: Admin Panel Migrations
-- This file contains all migrations for the admin panel

-- Migration 0001: Admin logs, commission configs, delinquents, materials, payments
CREATE TABLE IF NOT EXISTS `admin_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`adminId` int NOT NULL,
	`action` varchar(128) NOT NULL,
	`entityType` varchar(64),
	`entityId` int,
	`details` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `admin_logs_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `commission_configs` (
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

CREATE TABLE IF NOT EXISTS `delinquents` (
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

CREATE TABLE IF NOT EXISTS `material_downloads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`materialId` int NOT NULL,
	`affiliateId` int,
	`downloadedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `material_downloads_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `materials` (
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

CREATE TABLE IF NOT EXISTS `payments` (
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

-- Migration 0002: Affiliates, agents, network, upgrades
CREATE TABLE IF NOT EXISTS `affiliates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`affiliateCode` varchar(32) NOT NULL,
	`sponsorId` int,
	`commissionPercentage` int NOT NULL DEFAULT 10,
	`status` enum('active','inactive','suspended') NOT NULL DEFAULT 'active',
	`totalCommissions` decimal(15,2) NOT NULL DEFAULT '0',
	`pendingCommissions` decimal(15,2) NOT NULL DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `affiliates_id` PRIMARY KEY(`id`),
	CONSTRAINT `affiliates_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `affiliates_affiliateCode_unique` UNIQUE(`affiliateCode`)
);

CREATE TABLE IF NOT EXISTS `agent_upgrades` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` int NOT NULL,
	`upgradeId` int NOT NULL,
	`status` enum('active','inactive','expired') NOT NULL DEFAULT 'active',
	`activatedAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	CONSTRAINT `agent_upgrades_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `agents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` text NOT NULL,
	`status` enum('learning','active','paused','inactive') NOT NULL DEFAULT 'learning',
	`contentStrategy` text,
	`performanceScore` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agents_id` PRIMARY KEY(`id`),
	CONSTRAINT `agents_userId_unique` UNIQUE(`userId`)
);

CREATE TABLE IF NOT EXISTS `network` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sponsorId` int NOT NULL,
	`level` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `network_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `upgrades` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(128) NOT NULL,
	`description` text,
	`price` decimal(15,2) NOT NULL,
	`category` varchar(64) NOT NULL,
	`status` enum('available','discontinued') NOT NULL DEFAULT 'available',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `upgrades_id` PRIMARY KEY(`id`)
);

-- Migration 0003: Commissions and Orders
CREATE TABLE IF NOT EXISTS `commissions` (
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

CREATE TABLE IF NOT EXISTS `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`affiliateId` int NOT NULL,
	`externalOrderId` varchar(128) NOT NULL,
	`marketplace` varchar(64) NOT NULL,
	`amount` decimal(15,2) NOT NULL,
	`commissionAmount` decimal(15,2) NOT NULL,
	`status` enum('pending','confirmed','shipped','delivered','cancelled','refunded') NOT NULL DEFAULT 'pending',
	`customerName` varchar(128),
	`customerEmail` varchar(320),
	`shippingAddress` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
