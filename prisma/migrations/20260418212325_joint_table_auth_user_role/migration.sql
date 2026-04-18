/*
  Warnings:

  - You are about to drop the column `name` on the `archer` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `auth_user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[public_name]` on the table `archer` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `public_name` to the `archer` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "token" DROP CONSTRAINT "token_auth_user_id_fkey";

-- DropIndex
DROP INDEX "archer_name_key";

-- AlterTable
ALTER TABLE "archer" DROP COLUMN "name",
ADD COLUMN     "public_name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "auth_user" DROP COLUMN "role",
ADD COLUMN     "name" TEXT;

-- CreateTable
CREATE TABLE "auth_user_role" (
    "auth_user_id" UUID NOT NULL,
    "role" "role" NOT NULL DEFAULT 'member'
);

-- CreateIndex
CREATE UNIQUE INDEX "auth_user_role_auth_user_id_role_key" ON "auth_user_role"("auth_user_id", "role");

-- CreateIndex
CREATE UNIQUE INDEX "archer_public_name_key" ON "archer"("public_name");

-- AddForeignKey
ALTER TABLE "auth_user_role" ADD CONSTRAINT "auth_user_role_auth_user_id_fkey" FOREIGN KEY ("auth_user_id") REFERENCES "auth_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "token" ADD CONSTRAINT "token_auth_user_id_fkey" FOREIGN KEY ("auth_user_id") REFERENCES "auth_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
