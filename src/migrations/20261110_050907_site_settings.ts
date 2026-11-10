import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_site_settings_socials_platform" AS ENUM('instagram', 'vimeo', 'youtube', 'behance', 'dribbble', 'other');
  CREATE TYPE "public"."enum_site_settings_accent" AS ENUM('gold', 'terracotta', 'sage', 'offwhite');
  CREATE TYPE "public"."enum__site_settings_v_version_socials_platform" AS ENUM('instagram', 'vimeo', 'youtube', 'behance', 'dribbble', 'other');
  CREATE TYPE "public"."enum__site_settings_v_version_accent" AS ENUM('gold', 'terracotta', 'sage', 'offwhite');
  CREATE TABLE "site_settings_socials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" "enum_site_settings_socials_platform" NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role_line" varchar NOT NULL,
  	"location" varchar NOT NULL,
  	"contact_email" varchar NOT NULL,
  	"reply_time" varchar NOT NULL,
  	"accent" "enum_site_settings_accent" DEFAULT 'gold' NOT NULL,
  	"booking_label" varchar NOT NULL,
  	"headline" varchar NOT NULL,
  	"finale_headline" varchar NOT NULL,
  	"footer_note" varchar NOT NULL,
  	"default_meta_title_template" varchar NOT NULL,
  	"default_meta_description" varchar NOT NULL,
  	"default_meta_image_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_site_settings_v_version_socials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"platform" "enum__site_settings_v_version_socials_platform" NOT NULL,
  	"url" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_site_settings_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_name" varchar NOT NULL,
  	"version_role_line" varchar NOT NULL,
  	"version_location" varchar NOT NULL,
  	"version_contact_email" varchar NOT NULL,
  	"version_reply_time" varchar NOT NULL,
  	"version_accent" "enum__site_settings_v_version_accent" DEFAULT 'gold' NOT NULL,
  	"version_booking_label" varchar NOT NULL,
  	"version_headline" varchar NOT NULL,
  	"version_finale_headline" varchar NOT NULL,
  	"version_footer_note" varchar NOT NULL,
  	"version_default_meta_title_template" varchar NOT NULL,
  	"version_default_meta_description" varchar NOT NULL,
  	"version_default_meta_image_id" integer NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "site_settings_socials" ADD CONSTRAINT "site_settings_socials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_default_meta_image_id_media_id_fk" FOREIGN KEY ("default_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_site_settings_v_version_socials" ADD CONSTRAINT "_site_settings_v_version_socials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v" ADD CONSTRAINT "_site_settings_v_version_default_meta_image_id_media_id_fk" FOREIGN KEY ("version_default_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "site_settings_socials_order_idx" ON "site_settings_socials" USING btree ("_order");
  CREATE INDEX "site_settings_socials_parent_id_idx" ON "site_settings_socials" USING btree ("_parent_id");
  CREATE INDEX "site_settings_default_meta_default_meta_image_idx" ON "site_settings" USING btree ("default_meta_image_id");
  CREATE INDEX "_site_settings_v_version_socials_order_idx" ON "_site_settings_v_version_socials" USING btree ("_order");
  CREATE INDEX "_site_settings_v_version_socials_parent_id_idx" ON "_site_settings_v_version_socials" USING btree ("_parent_id");
  CREATE INDEX "_site_settings_v_version_default_meta_version_default_me_idx" ON "_site_settings_v" USING btree ("version_default_meta_image_id");
  CREATE INDEX "_site_settings_v_created_at_idx" ON "_site_settings_v" USING btree ("created_at");
  CREATE INDEX "_site_settings_v_updated_at_idx" ON "_site_settings_v" USING btree ("updated_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "site_settings_socials" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "_site_settings_v_version_socials" CASCADE;
  DROP TABLE "_site_settings_v" CASCADE;
  DROP TYPE "public"."enum_site_settings_socials_platform";
  DROP TYPE "public"."enum_site_settings_accent";
  DROP TYPE "public"."enum__site_settings_v_version_socials_platform";
  DROP TYPE "public"."enum__site_settings_v_version_accent";`)
}
