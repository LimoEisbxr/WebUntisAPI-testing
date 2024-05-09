/*
  Warnings:

  - Added the required column `discordUsername` to the `UntisUser` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UntisUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "discordId" TEXT NOT NULL,
    "discordUsername" TEXT NOT NULL,
    "untisSchoolName" TEXT NOT NULL,
    "untisUsername" TEXT NOT NULL,
    "untisPassword" TEXT NOT NULL,
    "untisUrl" TEXT NOT NULL
);
INSERT INTO "new_UntisUser" ("createdAt", "discordId", "id", "untisPassword", "untisSchoolName", "untisUrl", "untisUsername") SELECT "createdAt", "discordId", "id", "untisPassword", "untisSchoolName", "untisUrl", "untisUsername" FROM "UntisUser";
DROP TABLE "UntisUser";
ALTER TABLE "new_UntisUser" RENAME TO "UntisUser";
CREATE UNIQUE INDEX "UntisUser_discordId_key" ON "UntisUser"("discordId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
