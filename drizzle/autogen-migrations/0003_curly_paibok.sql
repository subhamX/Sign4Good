ALTER TABLE "monitored_envelopes" DROP COLUMN "id";
ALTER TABLE "monitored_envelopes" ADD PRIMARY KEY ("envelope_id");--> statement-breakpoint