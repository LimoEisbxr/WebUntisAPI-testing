-- CreateTable
CREATE TABLE "lessonNotifier" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "discordId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "lessonStart" DATETIME NOT NULL,
    "reminderTimeOffset" INTEGER NOT NULL
);
