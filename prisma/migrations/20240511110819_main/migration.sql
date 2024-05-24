-- CreateTable
CREATE TABLE "UntisUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "discordId" TEXT NOT NULL,
    "discordUsername" TEXT NOT NULL,
    "untisSchoolName" TEXT NOT NULL,
    "untisUsername" TEXT NOT NULL,
    "untisPassword" TEXT NOT NULL,
    "untisUrl" TEXT NOT NULL,
    "className" TEXT,
    CONSTRAINT "UntisUser_className_fkey" FOREIGN KEY ("className") REFERENCES "Class" ("className") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "lessonNotifier" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "discordId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "lessonStart" DATETIME NOT NULL,
    "reminderTimeOffset" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "primaryUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "discordId" TEXT NOT NULL,
    "primaryUserId" TEXT,
    CONSTRAINT "primaryUser_discordId_fkey" FOREIGN KEY ("discordId") REFERENCES "UntisUser" ("discordId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Lesson" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lessonId" INTEGER NOT NULL,
    "lessonCode" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "lessonState" TEXT NOT NULL,
    "rescheduleInfo" TEXT,
    "classId" INTEGER NOT NULL,
    CONSTRAINT "Lesson_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("classId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Teacher" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teacherId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "foreName" TEXT NOT NULL,
    "longName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL
);

-- CreateTable
CREATE TABLE "Class" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "classId" INTEGER NOT NULL,
    "className" TEXT NOT NULL,
    "longName" TEXT NOT NULL,
    "teacher_id" INTEGER,
    CONSTRAINT "Class_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "Teacher" ("teacherId") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "UntisUser_discordId_key" ON "UntisUser"("discordId");

-- CreateIndex
CREATE UNIQUE INDEX "primaryUser_discordId_key" ON "primaryUser"("discordId");

-- CreateIndex
CREATE UNIQUE INDEX "Lesson_lessonId_key" ON "Lesson"("lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_teacherId_key" ON "Teacher"("teacherId");

-- CreateIndex
CREATE UNIQUE INDEX "Class_classId_key" ON "Class"("classId");

-- CreateIndex
CREATE UNIQUE INDEX "Class_className_key" ON "Class"("className");
