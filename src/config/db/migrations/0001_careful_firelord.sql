CREATE TABLE "permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"service_id" uuid NOT NULL,
	"resource" varchar(128) NOT NULL,
	"action" varchar(128) NOT NULL,
	CONSTRAINT "service_resource_action_unique_constraint" UNIQUE("service_id","resource","action")
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(128) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_permission" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"service_id" uuid NOT NULL,
	"permission_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "keys" ADD COLUMN "service_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "keys" ADD CONSTRAINT "keys_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE cascade;