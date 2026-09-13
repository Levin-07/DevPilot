/*
  Warnings:

  - Made the column `user_id` on table `projects` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "projects" ALTER COLUMN "user_id" SET NOT NULL;

-- CreateIndex
CREATE INDEX "projects_user_id_idx" ON "projects"("user_id");
