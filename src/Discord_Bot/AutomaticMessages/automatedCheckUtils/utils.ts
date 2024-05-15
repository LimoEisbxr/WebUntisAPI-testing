import {
    PrismaClient,
    Lesson,
    Subject,
    Class,
    Teacher,
    Room,
} from '@prisma/client';

const prisma = new PrismaClient();

// Define new types that include the respective fields
type LessonWithSubject = Lesson & {
    subject: Subject | null;
};

type LessonWithClass = Lesson & {
    class: Class | null;
};

type LessonWithTeacher = Lesson & {
    teacher: Teacher | null;
};

type LessonWithRoom = Lesson & {
    room: Room | null;
};

// Utility function to calculate the difference in minutes between two times
function getMinutesDifference(time1: string, time2: string): number {
    const [hours1, minutes1] = time1.split(':').map(Number);
    const [hours2, minutes2] = time2.split(':').map(Number);

    const totalMinutes1 = hours1 * 60 + minutes1;
    const totalMinutes2 = hours2 * 60 + minutes2;

    return Math.abs(totalMinutes1 - totalMinutes2);
}

export async function getAllLessonsToDateAndTime(
    startDate: Date,
    maxRange: number,
    useCurrentTime?: boolean,
    startTime?: string,
    limit?: number
): Promise<
    (LessonWithSubject & LessonWithClass & LessonWithTeacher & LessonWithRoom)[]
> {
    // Fetch all lessons from the database along with related data
    const allLessons = await prisma.lesson.findMany({
        include: {
            class: true,
            teacher: true,
            room: true,
            subject: true,
        },
    });

    // Calculate the end date time for the range
    const endDate = new Date(startDate.getTime() + maxRange * 60 * 1000); // maxRange is in minutes

    // If useCurrentTime is false or undefined, parse startTime to a Date object
    let startTimeDate: Date;
    if (!useCurrentTime) {
        if (startTime === undefined) {
            throw new Error(
                'Either startTime or useCurrentTime must be provided'
            );
        }
        // Parse startTime to a Date object
        // Assuming startTime is in the format of "HH:MM"
        const [hours, minutes] = startTime.split(':').map(Number);
        startTimeDate = new Date(startDate.getTime());
        startTimeDate.setHours(hours, minutes, 0, 0);
    } else {
        startTimeDate = new Date(startDate.getTime());
    }

    // Filter the lessons based on the date range
    const lessonsInRange = allLessons.filter((lesson) => {
        // Check if lesson.date is a valid date string
        if (isNaN(Date.parse(String(lesson.date)))) {
            console.error('Invalid lesson.date:', lesson.date);
            return false;
        }

        const lessonDate = new Date(lesson.date);

        // Check if lesson.startTime is a valid time string
        let lessonStartHours: number, lessonStartMinutes: number;
        if (String(lesson.startTime).includes(':')) {
            [lessonStartHours, lessonStartMinutes] = String(lesson.startTime)
                .split(':')
                .map(Number);
        } else {
            // Handle time format without colon, e.g., "1205", "740"
            const timeString = String(lesson.startTime).padStart(4, '0');
            lessonStartHours = Number(timeString.substring(0, 2));
            lessonStartMinutes = Number(timeString.substring(2, 4));
        }

        if (isNaN(lessonStartHours) || isNaN(lessonStartMinutes)) {
            console.error('Invalid lesson.startTime:', lesson.startTime);
            return false;
        }

        // Create a Date object from lesson.startTime
        const lessonStartTime = new Date(lessonDate.getTime());
        lessonStartTime.setHours(lessonStartHours, lessonStartMinutes, 0, 0);

        console.log(
            'Lesson Date:',
            lessonDate,
            'Lesson Start Time:',
            lessonStartTime,
            'Start Time:',
            startTimeDate,
            'End Date:',
            endDate,
            'Lesson Subject:',
            lesson.subject?.name,
            'Lesson Id:',
            lesson.lessonId
        );

        const isInRange =
            lessonDate.getTime() >= startDate.getTime() &&
            lessonDate.getTime() <= endDate.getTime() &&
            lessonStartTime.getTime() >= startTimeDate.getTime();
        return isInRange;
    });

    lessonsInRange.sort((a, b) => {
        const aTime = new Date(a.date).getTime();
        const bTime = new Date(b.date).getTime();
        return aTime - bTime;
    });

    // console.log('Lessons in range:', lessonsInRange);

    // If limit is defined, return only the first 'limit' lessons
    if (limit !== undefined) {
        return lessonsInRange.slice(0, limit);
    }

    return lessonsInRange;
}
