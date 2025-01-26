ALTER TABLE "enterprise_info" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "is_onboarded";