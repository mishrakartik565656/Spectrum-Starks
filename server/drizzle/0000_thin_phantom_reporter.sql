CREATE TYPE "public"."role" AS ENUM('citizen', 'worker', 'supervisor', 'admin');--> statement-breakpoint
CREATE TYPE "public"."severity" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('submitted', 'assigned', 'in_progress', 'resolved');--> statement-breakpoint
CREATE TABLE "areas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"boundary" geometry,
	"supervisor_id" uuid
);
--> statement-breakpoint
CREATE TABLE "bins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"location" geometry,
	"type" varchar(50) NOT NULL,
	"capacity_liters" integer NOT NULL,
	"current_fill_percent" integer DEFAULT 0 NOT NULL,
	"is_overflowing" boolean DEFAULT false NOT NULL,
	"last_emptied_at" timestamp DEFAULT now() NOT NULL,
	"area_id" uuid
);
--> statement-breakpoint
CREATE TABLE "complaints" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"assigned_worker_id" uuid,
	"category" varchar(255) NOT NULL,
	"description" text,
	"severity" "severity" DEFAULT 'medium' NOT NULL,
	"status" "status" DEFAULT 'submitted' NOT NULL,
	"location" geometry,
	"address" text,
	"photo_url" text,
	"resolution_photo_url" text,
	"rating" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"resolved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"role" "role" DEFAULT 'citizen' NOT NULL,
	"eco_points" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "areas" ADD CONSTRAINT "areas_supervisor_id_users_id_fk" FOREIGN KEY ("supervisor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bins" ADD CONSTRAINT "bins_area_id_areas_id_fk" FOREIGN KEY ("area_id") REFERENCES "public"."areas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_assigned_worker_id_users_id_fk" FOREIGN KEY ("assigned_worker_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;