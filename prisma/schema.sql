-- Reference snapshot aligned with prisma/schema.prisma migrations (not the migration source of truth).
-- Prefer prisma migrate for applying changes.

CREATE TYPE "competition_category" AS ENUM ('indoor', 'outdoor');

CREATE TYPE "competition_type" AS ENUM ('olympic', 'beursault', 'field', 'nature', 'd3');

CREATE TYPE "registration_status" AS ENUM ('to_register', 'pending', 'waiting_list', 'registered', 'cancelled');

CREATE TYPE "payment_status" AS ENUM ('to_pay', 'pending_reimbursement', 'paid', 'cancelled');

CREATE TYPE "payer" AS ENUM ('archer', 'club');

CREATE TYPE "distance" AS ENUM ('m18', 'm50', 'm60', 'm70', 'beginner', 'other');

CREATE TYPE "target" AS ENUM ('trispot', 'spot40');

CREATE TYPE "weapon" AS ENUM ('recurve', 'barebow', 'longbow', 'compound');

CREATE TYPE "token_type" AS ENUM ('invitation', 'forgot_password', 'reset_password', 'change_email');

CREATE TABLE "auth_user" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" DATE NOT NULL,
    "authenticated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "auth_user_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "file" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "mimetype" TEXT NOT NULL,
    "url" TEXT,
    "bucket_id" TEXT,
    "internal_bucket_name" TEXT,
    "created_at" DATE NOT NULL,

    CONSTRAINT "file_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "archer" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "auth_user_id" UUID,
    "name" TEXT NOT NULL,
    "created_at" DATE NOT NULL,
    "offboarded_at" DATE NOT NULL,

    CONSTRAINT "archer_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "competition" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "file_id" UUID,
    "name" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "place" TEXT,
    "price" DECIMAL(8,2) NOT NULL,
    "category" "competition_category" NOT NULL,
    "type" "competition_type" NOT NULL,
    "is_championship" BOOLEAN NOT NULL DEFAULT false,
    "season_year" SMALLINT NOT NULL,
    "created_at" DATE NOT NULL,

    CONSTRAINT "competition_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "participation" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "archer_id" UUID NOT NULL,
    "competition_id" UUID NOT NULL,
    "registration_status" "registration_status" NOT NULL DEFAULT 'to_register',
    "payment_status" "payment_status" NOT NULL,
    "payer" "payer" NOT NULL DEFAULT 'archer',
    "distance" "distance" NOT NULL,
    "target" "target",
    "weapon" "weapon",
    "created_at" DATE NOT NULL,

    CONSTRAINT "participation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "token" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "auth_user_id" UUID NOT NULL,
    "token_value" TEXT NOT NULL,
    "type" "token_type" NOT NULL,
    "created_at" DATE NOT NULL,
    "expires_at" DATE NOT NULL,
    "used_at" DATE,

    CONSTRAINT "token_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "archer_auth_user_id_idx" ON "archer"("auth_user_id");

CREATE UNIQUE INDEX "archer_name_key" ON "archer"("name");

CREATE UNIQUE INDEX "auth_user_email_key" ON "auth_user"("email");

CREATE INDEX "competition_name_start_date_end_date_idx" ON "competition"("name", "start_date", "end_date");

ALTER TABLE "archer" ADD CONSTRAINT "archer_auth_user_id_fkey" FOREIGN KEY ("auth_user_id") REFERENCES "auth_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "competition" ADD CONSTRAINT "competition_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "file"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "participation" ADD CONSTRAINT "participation_archer_id_fkey" FOREIGN KEY ("archer_id") REFERENCES "archer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "participation" ADD CONSTRAINT "participation_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "competition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "token" ADD CONSTRAINT "token_auth_user_id_fkey" FOREIGN KEY ("auth_user_id") REFERENCES "auth_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
