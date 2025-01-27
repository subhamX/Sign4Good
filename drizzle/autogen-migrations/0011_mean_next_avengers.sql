ALTER TABLE "compliance_forms" DROP CONSTRAINT "compliance_forms_created_by_users_docusign_id_fk";
--> statement-breakpoint
ALTER TABLE "monitored_envelopes" ALTER COLUMN "monitoring_frequency_days" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "compliance_forms" ADD COLUMN "filled_by_compliance_officer_at" timestamp;--> statement-breakpoint
ALTER TABLE "compliance_forms" ADD COLUMN "signed_by_donor_at" timestamp;--> statement-breakpoint
ALTER TABLE "compliance_forms" DROP COLUMN "email_sent_at";--> statement-breakpoint
ALTER TABLE "compliance_forms" DROP COLUMN "created_by";--> statement-breakpoint
ALTER TABLE "monitored_envelopes" DROP COLUMN "is_funding_document";