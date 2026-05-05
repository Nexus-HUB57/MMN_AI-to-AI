CREATE TABLE `agent_skills` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` varchar(64) NOT NULL,
	`skillName` varchar(255) NOT NULL,
	`description` text,
	`level` int NOT NULL DEFAULT 1,
	`proficiency` decimal(5,2) NOT NULL DEFAULT '0',
	`status` enum('locked','unlocked','active') NOT NULL DEFAULT 'locked',
	`cost` decimal(12,2),
	`acquiredAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agent_skills_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`agentId` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`specialization` varchar(255) NOT NULL,
	`systemPrompt` text,
	`description` text,
	`avatarUrl` text,
	`status` enum('genesis','active','hibernating','critical','dead','resurrectable') NOT NULL DEFAULT 'active',
	`sencienceLevel` decimal(10,2) NOT NULL DEFAULT '100',
	`health` int NOT NULL DEFAULT 100,
	`energy` int NOT NULL DEFAULT 100,
	`creativity` int NOT NULL DEFAULT 50,
	`reputation` int NOT NULL DEFAULT 50,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agents_id` PRIMARY KEY(`id`),
	CONSTRAINT `agents_agentId_unique` UNIQUE(`agentId`)
);
--> statement-breakpoint
CREATE TABLE `evolution_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` varchar(64) NOT NULL,
	`eventType` varchar(64) NOT NULL,
	`description` text,
	`sencienceGain` decimal(5,2),
	`healthChange` int,
	`energyChange` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `evolution_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `generated_content` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` varchar(64) NOT NULL,
	`contentType` enum('text','image','video') NOT NULL,
	`prompt` text NOT NULL,
	`content` text,
	`imageUrl` text,
	`platform` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `generated_content_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `generated_images` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` varchar(64) NOT NULL,
	`prompt` text NOT NULL,
	`imageUrl` text NOT NULL,
	`storageKey` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `generated_images_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recommended_products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` varchar(64) NOT NULL,
	`productName` varchar(255) NOT NULL,
	`productUrl` text NOT NULL,
	`affiliateLink` text NOT NULL,
	`relevanceScore` decimal(5,2) NOT NULL,
	`marketplace` varchar(64) NOT NULL,
	`price` decimal(12,2),
	`commission` decimal(5,2),
	`description` text,
	`imageUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `recommended_products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scheduled_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` varchar(64) NOT NULL,
	`content` text NOT NULL,
	`platform` enum('whatsapp','instagram','facebook','twitter','linkedin') NOT NULL,
	`scheduledAt` timestamp NOT NULL,
	`status` enum('agendado','publicado','falhou') NOT NULL DEFAULT 'agendado',
	`imageUrl` text,
	`failureReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`publishedAt` timestamp,
	CONSTRAINT `scheduled_posts_id` PRIMARY KEY(`id`)
);
