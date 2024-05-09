-- CreateTable
CREATE TABLE "UntisUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "discordId" TEXT NOT NULL,
    "untisSchoolName" TEXT NOT NULL,
    "untisUsername" TEXT NOT NULL,
    "untisPassword" TEXT NOT NULL,
    "untisUrl" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "UntisUser_discordId_key" ON "UntisUser"("discordId");
