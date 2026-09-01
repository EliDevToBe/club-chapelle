-- AlterTable
ALTER TABLE "auth_user_role" ADD COLUMN "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD CONSTRAINT "auth_user_role_pkey" PRIMARY KEY ("id");