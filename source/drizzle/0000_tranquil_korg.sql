CREATE TABLE `command_receipts` (
	`owner` text NOT NULL,
	`learner` text NOT NULL,
	`event_id` text NOT NULL,
	`digest` text NOT NULL,
	`revision` integer NOT NULL,
	`at` text NOT NULL,
	PRIMARY KEY(`owner`, `learner`, `event_id`)
);
--> statement-breakpoint
CREATE TABLE `learners` (
	`owner` text NOT NULL,
	`id` text NOT NULL,
	`profile` text NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`updated_at` text NOT NULL,
	PRIMARY KEY(`owner`, `id`)
);
--> statement-breakpoint
CREATE TABLE `learning_attempts` (
	`owner` text NOT NULL,
	`learner` text NOT NULL,
	`id` text NOT NULL,
	`session` text NOT NULL,
	`content_id` text NOT NULL,
	`content_version` integer NOT NULL,
	`correct` integer NOT NULL,
	`payload` text NOT NULL,
	`at` text NOT NULL,
	PRIMARY KEY(`owner`, `learner`, `id`)
);
--> statement-breakpoint
CREATE TABLE `learning_states` (
	`owner` text NOT NULL,
	`learner` text NOT NULL,
	`state` text NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`last_event` text,
	`updated_at` text NOT NULL,
	PRIMARY KEY(`owner`, `learner`)
);
