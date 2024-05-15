import {
    PrismaClient,
    Lesson,
    Subject,
    Class,
    Teacher,
    Room,
    UntisUser,
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

type UntisUserWithClass = UntisUser & {
    class: Class | null;
};

// Utility function to calculate the difference in minutes between two times
function getMinutesDifference(time1: string, time2: string): number {
    // console.log(`time1: ${time1}`, `time2: ${time2}`);

    // Convert time1 and time2 to HH:MM format if they are not already
    time1 = time1.includes(':')
        ? time1
        : `${time1.slice(0, -2)}:${time1.slice(-2)}`;
    time2 = time2.includes(':')
        ? time2
        : `${time2.slice(0, -2)}:${time2.slice(-2)}`;

    // console.log(`time1: ${time1}`, `time2: ${time2}`);

    const [hours1, minutes1] = time1.split(':').map(Number);
    const [hours2, minutes2] = time2.split(':').map(Number);

    const totalMinutes1 = hours1 * 60 + minutes1;
    const totalMinutes2 = hours2 * 60 + minutes2;

    // console.log(`totalMinutes2: ${totalMinutes2}`);

    // console.log(`totalMinutes1: ${totalMinutes1}`);

    // console.log(`Difference: ${Math.abs(totalMinutes1 - totalMinutes2)}`);

    return Math.abs(totalMinutes1 - totalMinutes2);
}

export async function getAllLessonsToDateAndTime(
    maxRange: number,
    untisUser: UntisUserWithClass,
    dateOfTheLesson?: Date,
    useCurrentTime?: boolean,
    startTime?: string,
    limit?: number
): Promise<
    (LessonWithSubject & LessonWithClass & LessonWithTeacher & LessonWithRoom)[]
> {
    // If useCurrentTime is true, set dateOfTheLesson to the current date and time
    if (useCurrentTime || dateOfTheLesson === undefined) {
        dateOfTheLesson = new Date();
        startTime = `${dateOfTheLesson.getHours()}:${dateOfTheLesson.getMinutes()}`;
    }

    // Fetch all lessons from the database along with related data
    const allLessons = await prisma.lesson.findMany({
        where: {
            classId: untisUser.class?.classId,
        },
        include: {
            class: true,
            teacher: true,
            room: true,
            subject: true,
        },
    });

    console.log('All lessons:', allLessons); // Debug line

    // Calculate the end date time for the range
    const endDate = new Date(dateOfTheLesson.getTime() + 24 * 60 * 60 * 1000); // Adding 24 hours to dateOfTheLesson

    if (startTime === undefined) {
        throw new Error('startTime must be provided');
    }

    // Filter the lessons based on the date range
    const lessonsInRange = allLessons
        .map((lesson) => {
            // Check if lesson.date is a valid date string
            if (isNaN(Date.parse(String(lesson.date)))) {
                console.error('Invalid lesson.date:', lesson.date);
                return null;
            }

            const lessonDate = new Date(lesson.date);

            const minutesDifference = getMinutesDifference(
                lesson.startTime,
                startTime
            );
            const isInTimeRange =
                minutesDifference >= 0 && minutesDifference <= maxRange;
            // console.log('isInTimeRange: ', isInTimeRange); // Debug line

            const lessonDateOnly = new Date(lessonDate.setHours(0, 0, 0, 0));
            const dateOfTheLessonOnly = new Date(
                dateOfTheLesson.setHours(0, 0, 0, 0)
            );
            const endDateOnly = new Date(endDate.setHours(0, 0, 0, 0));

            const isAfterStartDate = lessonDateOnly >= dateOfTheLessonOnly;
            // console.log('isAfterStartDate: ', isAfterStartDate); // Debug line

            const isBeforeEndDate = lessonDateOnly <= endDateOnly;
            // console.log('isBeforeEndDate: ', isBeforeEndDate); // Debug line

            const isInRange =
                isAfterStartDate && isBeforeEndDate && isInTimeRange;

            // console.log('isInRange: ', isInRange); // Debug line

            return isInRange ? { lesson, minutesDifference } : null;
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

    // console.log('Lessons in range:', lessonsInRange); // Debug line

    lessonsInRange.sort((a, b) => {
        if (a && b) {
            return a.minutesDifference - b.minutesDifference;
        } else {
            return 0;
        }
    });

    // console.log('Lessons in range:', lessonsInRange); // Debug line

    // console.log('Lessons in range:', lessonsInRange);

    // If limit is defined, return only the first 'limit' lessons
    if (limit !== undefined) {
        return lessonsInRange.slice(0, limit).map((item) => item.lesson);
    }

    return lessonsInRange.map((item) => item.lesson);
}
