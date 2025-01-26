CREATE TABLE "enterprise_info" (
	"name" text NOT NULL,
	"docu_sign_account_id" text PRIMARY KEY NOT NULL,
	"docu_sign_base_url" text NOT NULL,
	"donation_link" text NOT NULL,
	"user_id" text,
	"country" text NOT NULL,
	"score" integer DEFAULT -1 NOT NULL,
	"include_in_leader_board" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"docusign_id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text NOT NULL,
	"is_onboarded" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_docusign_id_unique" UNIQUE("docusign_id")
);
--> statement-breakpoint
ALTER TABLE "enterprise_info" ADD CONSTRAINT "enterprise_info_user_id_users_docusign_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("docusign_id") ON DELETE no action ON UPDATE no action;