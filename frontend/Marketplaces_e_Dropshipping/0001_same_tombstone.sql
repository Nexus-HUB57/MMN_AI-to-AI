CREATE TABLE `affiliates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`affiliateCode` varchar(32) NOT NULL,
	`sponsorId` int,
	`commissionPercentage` int NOT NULL DEFAULT 10,
	`status` enum('active','inactive','suspended') NOT NULL DEFAULT 'active',
	`totalCommissions` int NOT NULL DEFAULT 0,
	`pendingCommissions` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `affiliates_id` PRIMARY KEY(`id`),
	CONSTRAINT `affiliates_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `affiliates_affiliateCode_unique` UNIQUE(`affiliateCode`)
);
--> statement-breakpoint
CREATE TABLE `commissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`affiliateId` int NOT NULL,
	`amount` int NOT NULL,
	`level` int NOT NULL DEFAULT 1,
	`source` varchar(64) NOT NULL,
	`sourceId` int,
	`status` enum('pending','confirmed','paid','cancelled') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `commissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` varchar(64) NOT NULL,
	`title` varchar(256) NOT NULL,
	`content` text,
	`relatedOrderId` int,
	`read` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_status_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`previousStatus` varchar(32),
	`newStatus` varchar(32) NOT NULL,
	`changedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `order_status_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`affiliateId` int NOT NULL,
	`productId` int NOT NULL,
	`externalOrderId` varchar(128) NOT NULL,
	`marketplace` varchar(64) NOT NULL,
	`amount` int NOT NULL,
	`commissionAmount` int NOT NULL,
	`status` enum('pending','confirmed','shipped','delivered','cancelled','refunded') NOT NULL DEFAULT 'pending',
	`customerName` varchar(128),
	`customerEmail` varchar(320),
	`shippingAddress` text,
	`trackingNumber` varchar(128),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`externalId` varchar(128) NOT NULL,
	`marketplace` varchar(64) NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`price` int NOT NULL,
	`commissionPercentage` decimal(5,2) NOT NULL,
	`category` varchar(128),
	`imageUrl` text,
	`url` text NOT NULL,
	`trending` int NOT NULL DEFAULT 0,
	`trendingScore` int NOT NULL DEFAULT 0,
	`demandLevel` varchar(32) DEFAULT 'medium',
	`competitionLevel` varchar(32) DEFAULT 'medium',
	`rating` decimal(3,1) DEFAULT '0',
	`sales` int DEFAULT 0,
	`syncedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `commission_affiliate_idx` ON `commissions` (`affiliateId`);--> statement-breakpoint
CREATE INDEX `user_notifications_idx` ON `notifications` (`userId`);--> statement-breakpoint
CREATE INDEX `notification_type_idx` ON `notifications` (`type`);--> statement-breakpoint
CREATE INDEX `order_history_idx` ON `order_status_history` (`orderId`);--> statement-breakpoint
CREATE INDEX `affiliate_idx` ON `orders` (`affiliateId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `orders` (`status`);--> statement-breakpoint
CREATE INDEX `marketplace_idx` ON `products` (`marketplace`);--> statement-breakpoint
CREATE INDEX `trending_idx` ON `products` (`trending`);