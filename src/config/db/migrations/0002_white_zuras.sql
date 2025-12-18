ALTER TABLE "service_permission" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "service_permission" CASCADE;--> statement-breakpoint
ALTER TABLE "permissions" DROP CONSTRAINT "service_resource_action_unique_constraint";--> statement-breakpoint
ALTER TABLE "permissions" ADD COLUMN "key" varchar(128) NOT NULL;--> statement-breakpoint
ALTER TABLE "permissions" DROP COLUMN "resource";--> statement-breakpoint
ALTER TABLE "permissions" DROP COLUMN "action";--> statement-breakpoint
ALTER TABLE "permissions" ADD CONSTRAINT "service_key_unique_constraint" UNIQUE("service_id","key");