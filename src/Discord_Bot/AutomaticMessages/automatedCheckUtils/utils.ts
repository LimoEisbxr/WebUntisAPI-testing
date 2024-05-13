import { PrismaClient, Lesson } from '@prisma/client';

const prisma = new PrismaClient();

export async function getAllLessonsToDateAndTime(
    startDate: Date,
    startTime: number,
    maxRange: number,
    limit: number
): Promise<Lesson[]> {
    // Fetch all lessons from the database
    const allLessons = await prisma.lesson.findMany();

    // Convert the provided start date to Unix timestamps in milliseconds
    const startDateTime = startDate.getTime();

    // Calculate the end date time for the range
    const endDateTime = startDateTime + maxRange * 60 * 1000; // maxRange is in minutes

    // Filter the lessons based on the date range
    const lessonsInRange = allLessons.filter((lesson) => {
        const lessonDate = new Date(lesson.date).getTime();
        const lessonTime =
            new Date(lesson.startTime).getHours() * 60 * 60 * 1000; // Convert lessonTime to a Date object directly from the Unix timestamp

        // Log the times being compared
        console.log(
            `lessonDate: ${lessonDate}, startDateTime: ${startDateTime}, endDateTime: ${endDateTime}`
        );
        console.log(`lessonTime: ${lessonTime}, startTime: ${startTime}`);

        const isInRange =
            lessonDate >= startDateTime &&
            lessonDate <= endDateTime &&
            lessonTime >= startTime;
        return isInRange;
    });

    // Limit the number of results
    const limitedLessons = lessonsInRange.slice(0, limit);

    return limitedLessons;
}
