import { WebUntis, Lesson } from "webuntis";

export async function sortLessonsByStartTime(
    lessons: Lesson[]
): Promise<Lesson[]> {
    return lessons.sort((a, b) => a.startTime - b.startTime);
}

export async function mergeLessons(lessons: Lesson[]): Promise<Lesson[]> {
    const mergedLessons: Lesson[] = [];

    // Sort lessons by start time
    lessons = await sortLessonsByStartTime(lessons);
    for (let i = 0; i < lessons.length; i++) {
        // If this is the last lesson or the next lesson is not consecutive or has a different subject or teacher
        if (
            i === lessons.length - 1 ||
            lessons[i].endTime + 300 < lessons[i + 1].startTime ||
            lessons[i].su[0].id !== lessons[i + 1].su[0].id ||
            lessons[i].te[0].id !== lessons[i + 1].te[0].id
        ) {
            // Add the current lesson to the merged lessons
            mergedLessons.push(lessons[i]);
        } else {
            // Merge the current lesson with the next one
            lessons[i + 1].startTime = lessons[i].startTime;
        }
    }

    return mergedLessons;
}
