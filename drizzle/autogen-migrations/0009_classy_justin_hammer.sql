CREATE TABLE "users_to_accounts_bridge" (
	"user_id" text NOT NULL,
	"account_id" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "enterprise_info" DROP CONSTRAINT "enterprise_info_user_id_users_docusign_id_fk";
--> statement-breakpoint
ALTER TABLE "users_to_accounts_bridge" ADD CONSTRAINT "users_to_accounts_bridge_user_id_users_docusign_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("docusign_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_to_accounts_bridge" ADD CONSTRAINT "users_to_accounts_bridge_account_id_enterprise_info_docu_sign_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."enterprise_info"("docu_sign_account_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enterprise_info" DROP COLUMN "user_id";