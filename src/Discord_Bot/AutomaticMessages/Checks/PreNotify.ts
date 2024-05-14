import { getAllUsersWithLessonNotifierDaily } from '../../../Database/databaseFunctions.js';
import { client } from '../../../index.js';
import { getAllLessonsToDateAndTime } from '../automatedCheckUtils/utils.js';

export async function preNotify() {
    const allUsersWithNotifySetup = await getAllUsersWithLessonNotifierDaily();

    // pingUserInDm('444429411891019776', 'Hello World!');

    let nextDayAt10 = new Date();
    nextDayAt10.setUTCDate(nextDayAt10.getUTCDate());
    nextDayAt10.setUTCHours(8, 0, 1, 0);

    const nextLesson = await getAllLessonsToDateAndTime(
        nextDayAt10, // startDate
        5000000, // maxRange
        false, // useCurrentTime
        '10:00', // startTime
        1 // limit
    );

    if (nextLesson[0] && nextLesson[0]['subject']) {
        console.log(nextLesson[0]['subject']['name'].toString());
    }

    console.log('Next lesson:', nextLesson);

    // console.log(allUsersWithNotifySetup);
}

async function pingUserInDm(userID: string, message: string) {
    try {
        const user = await client.users.fetch(userID);
        if (user) {
            await user.send(message);
        } else {
            console.log(`User with ID: ${userID} not found.`);
        }
    } catch (error) {
        console.error(`Failed to send DM: ${error}`);
    }
}
