import { getAllUsersWithLessonNotifierDaily } from '../../../Database/databaseFunctions.js';
import { createNextLessonMessage } from '../../Utility/messageSends.js';
import { getAllLessonsToDateAndTime } from '../automatedCheckUtils/utils.js';

export async function preNotify() {
    const allUsersWithNotifySetup = await getAllUsersWithLessonNotifierDaily();

    for (const untisUser of allUsersWithNotifySetup) {
        // tommorow as date

        const date = new Date();
        date.setDate(date.getDate() + 2);
        date.setHours(0, 0, 0, 0);

        // console.log('Date:', date);

        const nextLesson = await getAllLessonsToDateAndTime(
            10, // maxRange
            untisUser, // untisUser
            date, // startDate
            false, // useCurrentTimes
            '12:00', // startTime
            1 // limit
        );

        // if (nextLesson[0] && nextLesson[0]['subject']) {
        //     console.log(nextLesson[0]['subject']['name'].toString());
        // }

        createNextLessonMessage(
            `${untisUser.discordId}`, // User ID
            'Upcomming Lesson:',
            [
                ['Subject', nextLesson[0]?.subject?.longName || 'No subject'],
                ['Room', nextLesson[0]?.room?.name || 'No room'],
                ['Teacher', nextLesson[0]?.teacher?.longName || 'No teacher'],
                ['Start Time', nextLesson[0]?.startTime || 'No start time'],
                ['End Time', nextLesson[0]?.endTime || 'No end time'],
            ]
        );
        // time.sleep in typescript
        // if there was at least one lesson, wait 100 seconds
        if (nextLesson[0]) {
            await new Promise((r) => setTimeout(r, 100000));
        }

        // console.log('Next lesson for user', untisUser, ':', nextLesson);
    }
}
