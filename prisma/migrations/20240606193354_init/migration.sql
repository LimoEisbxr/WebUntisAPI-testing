-- CreateTable
CREATE TABLE "UntisUser" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "discordId" TEXT NOT NULL,
    "discordUsername" TEXT NOT NULL,
    "untisSchoolName" TEXT NOT NULL,
    "untisUsername" TEXT NOT NULL,
    "untisPassword" TEXT NOT NULL,
    "untisUrl" TEXT NOT NULL,
    "className" TEXT,

    CONSTRAINT "UntisUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lessonNotifier" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "discordId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "lessonStart" TIMESTAMP(3) NOT NULL,
    "reminderTimeOffset" INTEGER NOT NULL,

    CONSTRAINT "lessonNotifier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "primaryUser" (
    "id" TEXT NOT NULL,
    "discordId" TEXT NOT NULL,
    "primaryUserId" TEXT,

    CONSTRAINT "primaryUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lesson" (
    "id" TEXT NOT NULL,
    "lessonId" INTEGER NOT NULL,
    "lessonCode" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "lessonState" TEXT,
    "rescheduleInfo" TEXT,
    "classId" INTEGER,
    "teacherId" INTEGER,
    "sg" TEXT,
    "roomId" INTEGER,
    "subjectId" INTEGER,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL,
    "subjectId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "longName" TEXT,
    "alternateName" TEXT,
    "active" BOOLEAN,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Teacher" (
    "id" TEXT NOT NULL,
    "teacherId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "foreName" TEXT NOT NULL,
    "longName" TEXT NOT NULL,
    "title" TEXT,
    "active" BOOLEAN,

    CONSTRAINT "Teacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Class" (
    "id" TEXT NOT NULL,
    "classId" INTEGER NOT NULL,
    "className" TEXT NOT NULL,
    "longName" TEXT,
    "teacher_id" INTEGER,

    CONSTRAINT "Class_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "roomId" INTEGER NOT NULL,
    "name" TEXT,
    "longName" TEXT,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lessonNotifierDaily" (
    "id" TEXT NOT NULL,
    "discordId" TEXT NOT NULL,
    "perDM" BOOLEAN,
    "channelId" TEXT NOT NULL,
    "guildId" TEXT,
    "onlyInBreak" BOOLEAN,
    "offset" INTEGER,

    CONSTRAINT "lessonNotifierDaily_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WoLRemoteUser" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "discordId" TEXT NOT NULL,
    "sshhost" TEXT NOT NULL,
    "sshport" INTEGER NOT NULL,
    "sshuser" TEXT NOT NULL,
    "sshkey" TEXT NOT NULL,
    "targetmac" TEXT NOT NULL,

    CONSTRAINT "WoLRemoteUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UntisUser_discordId_key" ON "UntisUser"("discordId");

-- CreateIndex
CREATE UNIQUE INDEX "primaryUser_discordId_key" ON "primaryUser"("discordId");

-- CreateIndex
CREATE UNIQUE INDEX "Lesson_lessonId_key" ON "Lesson"("lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_subjectId_key" ON "Subject"("subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_teacherId_key" ON "Teacher"("teacherId");

-- CreateIndex
CREATE UNIQUE INDEX "Class_classId_key" ON "Class"("classId");

-- CreateIndex
CREATE UNIQUE INDEX "Class_className_key" ON "Class"("className");

-- CreateIndex
CREATE UNIQUE INDEX "Room_roomId_key" ON "Room"("roomId");

-- CreateIndex
CREATE UNIQUE INDEX "lessonNotifierDaily_discordId_key" ON "lessonNotifierDaily"("discordId");

-- CreateIndex
CREATE UNIQUE INDEX "WoLRemoteUser_discordId_key" ON "WoLRemoteUser"("discordId");

-- AddForeignKey
ALTER TABLE "UntisUser" ADD CONSTRAINT "UntisUser_className_fkey" FOREIGN KEY ("className") REFERENCES "Class"("className") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "primaryUser" ADD CONSTRAINT "primaryUser_discordId_fkey" FOREIGN KEY ("discordId") REFERENCES "UntisUser"("discordId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("classId") ON DELETE SET DEFAULT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("teacherId") ON DELETE SET DEFAULT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("roomId") ON DELETE SET DEFAULT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("subjectId") ON DELETE SET DEFAULT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "Teacher"("teacherId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessonNotifierDaily" ADD CONSTRAINT "lessonNotifierDaily_discordId_fkey" FOREIGN KEY ("discordId") REFERENCES "UntisUser"("discordId") ON DELETE RESTRICT ON UPDATE CASCADE;
