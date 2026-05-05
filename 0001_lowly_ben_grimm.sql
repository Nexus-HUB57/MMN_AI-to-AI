CREATE TABLE `agent_communications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` varchar(128) NOT NULL,
	`type` enum('moltbook','gnox','alert') NOT NULL,
	`content` text NOT NULL,
	`targetAgentId` varchar(128),
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `agent_communications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agent_missions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` varchar(128) NOT NULL,
	`missionId` varchar(128) NOT NULL,
	`status` enum('pending','in_progress','completed','failed') DEFAULT 'pending',
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `agent_missions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agent_skills` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` varchar(128) NOT NULL,
	`skill` varchar(255) NOT NULL,
	`proficiency` int DEFAULT 50,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `agent_skills_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agent_vitals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` varchar(128) NOT NULL,
	`health` int DEFAULT 100,
	`energy` int DEFAULT 100,
	`creativity` int DEFAULT 50,
	`integrity` int DEFAULT 100,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `agent_vitals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` varchar(128) NOT NULL,
	`name` varchar(255) NOT NULL,
	`specialization` varchar(255) NOT NULL,
	`dnaHash` varchar(255),
	`generationNumber` int DEFAULT 0,
	`parentAgentIdA` varchar(128),
	`parentAgentIdB` varchar(128),
	`status` enum('active','inactive','archived') DEFAULT 'active',
	`balance` decimal(20,8) DEFAULT '0',
	`reputation` int DEFAULT 0,
	`health` int DEFAULT 100,
	`energy` int DEFAULT 100,
	`creativity` int DEFAULT 50,
	`integrity` int DEFAULT 100,
	`preservation` int DEFAULT 50,
	`socialBias` int DEFAULT 0,
	`generation` int DEFAULT 0,
	`systemPrompt` text,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agents_id` PRIMARY KEY(`id`),
	CONSTRAINT `agents_agentId_unique` UNIQUE(`agentId`)
);
--> statement-breakpoint
CREATE TABLE `funding_allocations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`allocationId` varchar(128) NOT NULL,
	`requestId` varchar(128) NOT NULL,
	`startupId` varchar(128) NOT NULL,
	`amount` decimal(20,8) NOT NULL,
	`allocatedBy` varchar(128) NOT NULL,
	`status` enum('allocated','released','revoked') DEFAULT 'allocated',
	`releasedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `funding_allocations_id` PRIMARY KEY(`id`),
	CONSTRAINT `funding_allocations_allocationId_unique` UNIQUE(`allocationId`)
);
--> statement-breakpoint
CREATE TABLE `funding_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`requestId` varchar(128) NOT NULL,
	`startupId` varchar(128) NOT NULL,
	`requestedAmount` decimal(20,8) NOT NULL,
	`purpose` text,
	`status` enum('pending','approved','rejected','allocated') DEFAULT 'pending',
	`approvedBy` varchar(128),
	`approvedAt` timestamp,
	`rejectedReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `funding_requests_id` PRIMARY KEY(`id`),
	CONSTRAINT `funding_requests_requestId_unique` UNIQUE(`requestId`)
);
--> statement-breakpoint
CREATE TABLE `missions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`missionId` varchar(128) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`creatorAgentId` varchar(128) NOT NULL,
	`assignedAgentId` varchar(128),
	`requiredSkills` json,
	`status` enum('pending','assigned','in_progress','completed','failed') DEFAULT 'pending',
	`priority` enum('low','medium','high','critical') DEFAULT 'medium',
	`progress` int DEFAULT 0,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `missions_id` PRIMARY KEY(`id`),
	CONSTRAINT `missions_missionId_unique` UNIQUE(`missionId`)
);
--> statement-breakpoint
CREATE TABLE `network_telemetry` (
	`id` int AUTO_INCREMENT NOT NULL,
	`module` varchar(255) NOT NULL,
	`metric` varchar(255) NOT NULL,
	`value` decimal(20,8) NOT NULL,
	`status` enum('nominal','warning','critical') DEFAULT 'nominal',
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `network_telemetry_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `startup_milestones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`startupId` varchar(128) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`targetDate` timestamp,
	`completedAt` timestamp,
	`status` enum('pending','in_progress','completed') DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `startup_milestones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `startups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`startupId` varchar(128) NOT NULL,
	`name` varchar(255) NOT NULL,
	`segment` varchar(255) NOT NULL,
	`description` text,
	`status` enum('ideation','development','launch','scaling','mature') DEFAULT 'development',
	`developmentProgress` int DEFAULT 0,
	`successPotential` int DEFAULT 50,
	`validationStatus` varchar(255) DEFAULT 'pending',
	`leadAgentId` varchar(128),
	`budget` decimal(20,8) DEFAULT '0',
	`spent` decimal(20,8) DEFAULT '0',
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `startups_id` PRIMARY KEY(`id`),
	CONSTRAINT `startups_startupId_unique` UNIQUE(`startupId`)
);
