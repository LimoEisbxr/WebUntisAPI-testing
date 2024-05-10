import { WebUntis } from 'webuntis';
import {
    getRandomPrimaryUser,
    saveToDB,
} from '../Database/databaseFunctions.js';
import { getAllClasses, getAllTeachers } from './APIFunctions.js';

export async function updateDB() {
    const primaryUser = await getRandomPrimaryUser();

    if (primaryUser === false) {
        console.log('No primary user found!');
        return;
    }

    const untis = new WebUntis(
        primaryUser.UntisUser.untisSchoolName,
        primaryUser.UntisUser.untisUsername,
        primaryUser.UntisUser.untisPassword,
        primaryUser.UntisUser.untisUrl
    );

    const allTeachers = await getAllTeachers(untis);

    const renamedTeachers = renameJsonTeacherData(allTeachers);

    saveToDB('Teacher', renamedTeachers);

    const allClasses = await getAllClasses(untis);

    const renamedClasses = renameAndDeleteJsonData(allClasses);

    saveToDB('Class', renamedClasses);

    console.log('DB updated!');
}

function renameJsonTeacherData(data: any[]): any[] {
    return data.map((item) => {
        const { id: teacherId, dids, ...rest } = item;
        return { teacherId, ...rest };
    });
}

function renameAndDeleteJsonData(data: any[]): any[] {
    return data.map((item) => {
        const {
            id: classId,
            name: classname,
            active,
            teacher1: teacher,
            ...rest
        } = item;
        return { classId, classname, ...rest };
    });
}
