/*
  Warnings:

  - A unique constraint covering the columns `[auth_user_id]` on the table `archer` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "archer_auth_user_id_key" ON "archer"("auth_user_id");
