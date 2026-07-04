-- CreateEnum
CREATE TYPE "session" AS ENUM ('session_1', 'session_2', 'session_3', 'session_4', 'session_5', 'session_6');

-- AlterTable
ALTER TABLE "participation" ADD COLUMN     "session" "session";
