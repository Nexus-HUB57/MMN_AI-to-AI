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
CREATE TABLE `orders` (
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
