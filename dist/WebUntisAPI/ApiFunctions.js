export async function getTimetableForToday(untis) {
    await untis.login();
    const timetable_today = await untis.getOwnTimetableForToday();
    await untis.logout();
    return timetable_today;
}
export async function getTimeTableForDate(untis, date) {
    await untis.login();
    const timetable = await untis.getOwnTimetableFor(date);
    await untis.logout();
    return timetable;
}
export async function getTimeTableForWeek(untis, date, returnWithTeachers = false) {
    if (returnWithTeachers) {
        var formatId = 1;
    }
    else {
        var formatId = 2;
    }
    await untis.login();
    const timetable = await untis.getOwnTimetableForWeek(date, formatId);
    await untis.logout();
    return timetable;
}
//# sourceMappingURL=APIFunctions.js.map