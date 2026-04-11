/*
  Warnings:

  - You are about to alter the column `price` on the `competition` table. The data in that column could be lost. The data in that column will be cast from `Decimal(8,2)` to `Decimal(6,2)`.
  - Added the required column `role` to the `auth_user` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "role" AS ENUM ('member', 'manager', 'admin', 'developer');

-- AlterTable
ALTER TABLE "archer" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "auth_user" ADD COLUMN     "role" "role" NOT NULL,
ALTER COLUMN "password" DROP NOT NULL,
ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "competition" ALTER COLUMN "price" SET DATA TYPE DECIMAL(6,2),
ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "file" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "participation" ALTER COLUMN "payment_status" SET DEFAULT 'to_pay',
ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "token" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;
