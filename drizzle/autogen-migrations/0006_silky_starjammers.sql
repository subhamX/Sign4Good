CREATE TABLE "compliance_forms" (
	"id" serial PRIMARY KEY NOT NULL,
	"envelope_id" text NOT NULL,
	"form_data" jsonb NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"due_date" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "monitored_envelopes" ADD COLUMN "additional_info" jsonb;--> statement-breakpoint
ALTER TABLE "compliance_forms" ADD CONSTRAINT "compliance_forms_envelope_id_monitored_envelopes_envelope_id_fk" FOREIGN KEY ("envelope_id") REFERENCES "public"."monitored_envelopes"("envelope_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_forms" ADD CONSTRAINT "compliance_forms_created_by_users_docusign_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("docusign_id") ON DELETE no action ON UPDATE no action;