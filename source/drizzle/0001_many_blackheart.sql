CREATE TABLE `kana_drawings` (
	`owner` text NOT NULL,
	`learner` text NOT NULL,
	`char` text NOT NULL,
	`strokes` text NOT NULL,
	`updated_at` text NOT NULL,
	PRIMARY KEY(`owner`, `learner`, `char`)
);
--> statement-breakpoint
CREATE TABLE `kana_practices` (
	`owner` text NOT NULL,
	`learner` text NOT NULL,
	`event_id` text NOT NULL,
	`char` text NOT NULL,
	`stroke_count` integer NOT NULL,
	`evidence` text NOT NULL,
	`at` text NOT NULL,
	PRIMARY KEY(`owner`, `learner`, `event_id`)
);
--> statement-breakpoint
CREATE TABLE `kana_states` (
	`owner` text NOT NULL,
	`learner` text NOT NULL,
	`state` text NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`last_event` text,
	`updated_at` text NOT NULL,
	PRIMARY KEY(`owner`, `learner`)
);
