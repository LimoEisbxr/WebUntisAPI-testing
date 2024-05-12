import { WebUntis } from 'webuntis';
import {
    getAllRegisteredClasses,
    getDataFromTableByKey,
    getRandomPrimaryUser,
    saveToDB,
} from '../Database/databaseFunctions.js';
import {
    getAllClasses,
    getAllLessonsForAClass,
    getAllTeachers,
} from './APIFunctions.js';
import { PrismaClient } from '@prisma/client';

export async function updateDB(untisUser?: WebUntis): Promise<void> {
    let untis: undefined | WebUntis = undefined;
    if (!untisUser) {
        const primaryUser = await getRandomPrimaryUser();

        if (primaryUser === false) {
            console.log('No primary user found!');
            return;
        }

        untis = new WebUntis(
            primaryUser.UntisUser.untisSchoolName,
            primaryUser.UntisUser.untisUsername,
            primaryUser.UntisUser.untisPassword,
            primaryUser.UntisUser.untisUrl
        );
    } else {
        untis = untisUser;
    }

    const allTeachers = await getAllTeachers(untis);

    const renamedTeachers = renameJsonTeacherData(allTeachers);

    saveToDB('Teacher', 'teacherId', renamedTeachers);

    const allClasses = await getAllClasses(untis);

    const renamedClasses = renameAndDeleteJsonData(allClasses);

    // console.log('renamed classes: ', renamedClasses);

    for (const classData of renamedClasses) {
        saveClassWithTeacher(classData);
    }

    // Get all Lessons

    const allRegisteredClassesUnits = await getAllRegisteredClasses();

    let allLessons: LessonModel[] = [];

    // console.log('allRegisteredClasses: ', allRegisteredClassesUnits);

    // 10 Days in the future and the past
    const rangeStart = new Date(Date.now() - 1000 * 60 * 60 * 24 * 10);
    const rangeEnd = new Date(Date.now() + 1000 * 60 * 60 * 24 * 10);

    for (const classData of allRegisteredClassesUnits) {
        const user = (
            await getDataFromTableByKey(
                'UntisUser',
                'className',
                classData.className
            )
        )[0];

        const untis = new WebUntis(
            user.untisSchoolName,
            user.untisUsername,
            user.untisPassword,
            user.untisUrl
        );

        const lessonData = await getAllLessonsForAClass(untis, [
            rangeStart,
            rangeEnd,
        ]);

        // console.log('### kl ###: ', lessonData[0].kl);

        // console.log('lessonData: ', lessonData);

        allLessons = lessonData.map((lesson: any) => {
            return mapToLessonModel(lesson);
        }) as LessonModel[];

        // console.log('allLessons: ', allLessons);

        // Save all lessons to the database
        await saveLessonsToDB('Lesson', 'lessonId', allLessons);
    }

    console.log('DB updated!');
}
// #################################################################################
// #################################################################################

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

const mapToLessonModel = (obj: any): LessonModel => {
    const dateStr = obj.date ? obj.date.toString() : '';
    const formattedDate = dateStr
        ? new Date(
              dateStr.slice(0, 4) +
                  '-' +
                  dateStr.slice(4, 6) +
                  '-' +
                  dateStr.slice(6, 8)
          )
        : new Date();

    // console.log('obj.kl: ', obj.kl);
    const kl = obj.kl
        ? obj.kl.map(
              (klObj: {
                  name: { toString: () => any };
                  longname: { toString: () => any };
              }) => ({
                  name: klObj.name.toString(),
                  longName: klObj.longname.toString(),
                  lessonId: obj.id.toString(),
              })
          )
        : [];

    return {
        id: obj.id ? obj.id.toString() : '',
        lessonId: obj.lsnumber || 0,
        lessonCode: obj.activityType || '',
        date: formattedDate,
        startTime: obj.startTime
            ? new Date(obj.startTime.toString())
            : new Date(),
        endTime: obj.endTime ? new Date(obj.endTime.toString()) : new Date(),
        lessonState: obj.lessonState || 'Some State',
        rescheduleInfo: obj.rescheduleInfo || null,
        classId: obj.classId || 1,
        kl: {
            create: kl,
        },
        teacher: obj.te || [],
        ro: obj.ro || [],
        subject: obj.su || [],
        sg: obj.sg || '',
    };
};

async function saveLessonsToDB(
    modelName: string,
    uniqueIdentifier: string,
    data: any[]
): Promise<void> {
    try {
        for (const item of data) {
            console.log('item: ', item);
            console.log('item.kl: ', item.kl);

            // Extract kl data and remove it from item
            const klData = item.kl;
            delete item.kl;

            // First, upsert the Lesson
            const upsertedLesson = await prisma[modelName].upsert({
                where: { [uniqueIdentifier]: item[uniqueIdentifier] },
                update: item,
                create: item,
            });

            // Then, upsert the Kl items with the lessonId set to the upserted Lesson's id
            for (const klItem of klData.create) {
                klItem.lessonId = upsertedLesson.id;
                await prisma.Kl.upsert({
                    where: { [uniqueIdentifier]: klItem[uniqueIdentifier] },
                    update: klItem,
                    create: klItem,
                });
            }
        }
        console.log('Data saved successfully');
    } catch (error) {
        console.error(
            `An error occurred while saving the data to ${modelName}:`,
            error
        );
    }
}

interface KlCreateInput {
    create: { name: string; longName: string; lessonId: string }[];
}

interface LessonModel {
    id: string;
    lessonId: number;
    lessonCode: string;
    date: Date;
    startTime: Date;
    endTime: Date;
    lessonState: string;
    rescheduleInfo: null | RescheduleInfo;
    classId: number;
    kl: KlCreateInput | null;
    teacher: any[];
    ro: any[];
    subject: any[];
    sg: string;
}

interface RescheduleInfo {
    // Define the properties of RescheduleInfo interface here
}
