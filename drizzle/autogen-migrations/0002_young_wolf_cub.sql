CREATE TABLE "monitored_envelopes" (
	"id" serial PRIMARY KEY NOT NULL,
	"envelope_id" text NOT NULL,
	"account_id" text NOT NULL,
	"compliance_officer_email" text NOT NULL,
	"monitoring_frequency_days" integer DEFAULT 14 NOT NULL,
	"next_review_date" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "monitored_envelopes" ADD CONSTRAINT "monitored_envelopes_account_id_enterprise_info_docu_sign_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."enterprise_info"("docu_sign_account_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monitored_envelopes" ADD CONSTRAINT "monitored_envelopes_created_by_users_docusign_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("docusign_id") ON DELETE no action ON UPDATE no action;