/*
  Warnings:

  - You are about to drop the column `name` on the `website_config` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[key]` on the table `website_config` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `key` to the `website_config` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "website_config_name_idx";

-- DropIndex
DROP INDEX "website_config_name_key";

-- AlterTable
ALTER TABLE "website_config" DROP COLUMN "name",
ADD COLUMN     "key" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "website_config_key_idx" ON "website_config"("key");

-- CreateIndex
CREATE UNIQUE INDEX "website_config_key_key" ON "website_config"("key");
