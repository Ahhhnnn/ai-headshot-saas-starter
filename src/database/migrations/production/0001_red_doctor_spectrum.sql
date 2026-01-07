CREATE TABLE "generations" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"provider" text DEFAULT 'v3' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"inputImageUrl" text,
	"prompt" text,
	"styleId" text,
	"outputImageUrl" text,
	"error" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "generations" ADD CONSTRAINT "generations_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "generations_userId_idx" ON "generations" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "generations_status_idx" ON "generations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "generations_createdAt_idx" ON "generations" USING btree ("createdAt");