import { Homework, Lesson, Teacher, WebAPITimetable, WebUntis } from 'webuntis';

export async function getTimetableForToday(untis: WebUntis): Promise<Lesson[]> {
    await untis.login();
    const timetable_today: Lesson[] = await untis.getOwnTimetableForToday();
    await untis.logout();

    return timetable_today;
}

export async function getTimeTableForDate(
    untis: WebUntis,
    date: Date
): Promise<Lesson[]> {
    await untis.login();
    const timetable: Lesson[] = await untis.getOwnTimetableFor(date);
    await untis.logout();

    return timetable;
}

export async function getTimeTableForWeek(
    untis: WebUntis,
    date: Date,
    returnWithTeachers: boolean = false
): Promise<WebAPITimetable[]> {
    if (returnWithTeachers) {
        var formatId: number = 1;
    } else {
        var formatId: number = 2;
    }

    await untis.login();
    const timetable: WebAPITimetable[] = await untis.getOwnTimetableForWeek(
        date,
        formatId
    );
    await untis.logout();

    return timetable;
}

export async function getHomeWorksFor(
    untis: WebUntis,
    dateStart: Date,
    dateEnd: Date
): Promise<Homework[]> {
    await untis.login();
    const homework_today: Homework[] = await untis.getHomeWorksFor(
        dateStart,
        dateEnd
    );
    await untis.logout();

    return homework_today;
}

export async function getAllTeachers(untis: WebUntis): Promise<Teacher[]> {
    await untis.login();
    const teachers: Teacher[] = await untis.getTeachers();
    await untis.logout();

    return teachers;
}

export async function getAllClasses(untis: WebUntis): Promise<any[]> {
    await untis.login();

    const currentSchoolyear = await untis.getCurrentSchoolyear();

    const classes: any[] = await untis.getClasses(false, currentSchoolyear.id);
    await untis.logout();

    return classes;
}

export async function getAllStudents(untis: WebUntis): Promise<any[]> {
    await untis.login();

    const students: any[] = await untis.getStudents(false);
    await untis.logout();

    return students;
}

// export async function returnTheCurrentActiveUserClass(
//     untis: WebUntis
// ): Promise<any> {
//     await untis.login();

//     const timeTableToday = await untis.getOwnTimetableForToday();
// }

// export async function retrunAllValidAccounts() {}

// export async function getTheLessonsForThisWeek(): Promise<Lesson[]> {
//     await untis.login();

//     const lessons: Lesson[] = await untis.getOwnTimetableForThisWeek();
//     await untis.logout();

//     return lessons;
// }
