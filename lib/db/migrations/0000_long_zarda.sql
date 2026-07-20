CREATE TYPE "public"."client_source" AS ENUM('manual', 'shopify');--> statement-breakpoint
CREATE TYPE "public"."client_status" AS ENUM('Активен', 'Нов', 'Неактивен');--> statement-breakpoint
CREATE TYPE "public"."communication_channel" AS ENUM('email', 'call', 'note');--> statement-breakpoint
CREATE TYPE "public"."communication_direction" AS ENUM('incoming', 'outgoing');--> statement-breakpoint
CREATE TABLE "client_communications" (
	"id" text PRIMARY KEY NOT NULL,
	"client_id" text NOT NULL,
	"channel" "communication_channel" NOT NULL,
	"direction" "communication_direction" NOT NULL,
	"subject" text NOT NULL,
	"preview" text DEFAULT '' NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" text PRIMARY KEY NOT NULL,
	"board_id" text NOT NULL,
	"company" text NOT NULL,
	"contact" text DEFAULT '' NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"status" "client_status" DEFAULT 'Нов' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"source" "client_source" DEFAULT 'manual' NOT NULL,
	"shopify_customer_id" text,
	"last_contact_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "clients_shopify_customer_id_unique" UNIQUE("shopify_customer_id")
);
--> statement-breakpoint
CREATE TABLE "pipeline_boards" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "client_communications" ADD CONSTRAINT "client_communications_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_board_id_pipeline_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."pipeline_boards"("id") ON DELETE cascade ON UPDATE no action;