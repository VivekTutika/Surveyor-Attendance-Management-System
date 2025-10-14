-- AlterTable
ALTER TABLE "reports" ALTER COLUMN "created_by" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "employee_id" TEXT;
