import { WebUntis } from 'webuntis';
import {
    getRandomPrimaryUser,
    saveToDB,
} from '../Database/databaseFunctions.js';
import { getAllClasses, getAllTeachers } from './APIFunctions.js';
import { PrismaClient } from '@prisma/client';

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

    saveToDB('Teacher', 'teacherId', renamedTeachers);

    const allClasses = await getAllClasses(untis);

    const renamedClasses = renameAndDeleteJsonData(allClasses);

    // console.log('renamed classes: ', renamedClasses);

    for (const classData of renamedClasses) {
        saveClassWithTeacher(classData);
    }

    console.log('DB updated!');
}

function renameJsonTeacherData(data: any[]): any[] {
    return data.map((item) => {
        const { id: teacherId, dids, ...rest } = item;
        return { teacherId, ...rest };
    });
}

function renameAndDeleteJsonData(data: any[]): any[] {
    // console.log('renaming and deleting data: ', data);
    return data.map((item) => {
        const {
            id: classId,
            name: className,
            active,
            teacher1: teacherId,
            ...rest
        } = item;
        return { classId, className, teacherId, ...rest };
    });
}

const prisma = new PrismaClient() as any;

async function saveClassWithTeacher(classData: any): Promise<void> {
    // console.log('classData: ', classData);
    try {
        let teacherId = classData.teacherId;

        // Define the type for data
        let data: { className: any; longName: any; teacherId?: any } = {
            className: classData.className,
            longName: classData.longName,
        };

        // If teacherId is defined, add it to the data
        if (teacherId !== undefined) {
            data['teacherId'] = teacherId;
        } else {
            // console.log('teacherId is undefined');
        }

        // Upsert class with teacherId as foreign key if it's defined
        await prisma.Class.upsert({
            where: { classId: classData.classId },
            update: data,
            create: {
                classId: classData.classId,
                ...data,
            },
        });

        // console.log('Class with teacher upserted successfully');
    } catch (error) {
        console.error(
            `An error occurred while upserting the class with teacher:`,
            error
        );
    }
}
