ALTER TABLE "monitored_envelopes" ADD COLUMN "is_processed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "monitored_envelopes" ADD COLUMN "is_funding_document" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "monitored_envelopes" ADD COLUMN "money_received_till_date" integer DEFAULT 0 NOT NULL;