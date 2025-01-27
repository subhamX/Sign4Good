ALTER TABLE "compliance_forms" ADD COLUMN "email_sent_to_donor_at" timestamp;--> statement-breakpoint
ALTER TABLE "compliance_forms" DROP COLUMN "is_completed";