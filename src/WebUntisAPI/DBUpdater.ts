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
    getAllRooms,
    getAllSubjects,
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

    const renamedTeachers = await renameJsonTeacherData(allTeachers);

    await saveToDB('Teacher', 'teacherId', renamedTeachers);

    const allClasses = await getAllClasses(untis);

    const renamedClasses = await renameAndDeleteJsonData(allClasses);

    // console.log('renamed classes: ', renamedClasses);

    for (const classData of renamedClasses) {
        await saveClassWithTeacher(classData);
    }

    const allRooms = await getAllRooms(untis);
    const remappedRooms = allRooms.map(mapToRoomModel);

    // console.log('allRooms: ', remappedRooms);

    await saveToDB('Room', 'roomId', remappedRooms);

    const allSubjects = await getAllSubjects(untis);
    const remappedSubjects = await allSubjects.map(mapToSubjectModel);

    await saveToDB('Subject', 'subjectId', remappedSubjects);

    // Get all Lessons

    const allRegisteredClassesUntis = await getAllRegisteredClasses();

    let allLessons: LessonModel[] = [];

    // console.log('allRegisteredClasses: ', allRegisteredClassesUnits);

    // 10 Days in the future and the past
    const rangeStart = new Date(Date.now() - 1000 * 60 * 60 * 24 * 10);
    const rangeEnd = new Date(Date.now() + 1000 * 60 * 60 * 24 * 10);

    for (const classData of allRegisteredClassesUntis) {
        // console.log('classData: ', classData);
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

        // console.log('### ro ###: ', lessonData[2].ro);
        // console.log('### kl ###: ', lessonData[2].kl);
        // console.log('### subject ###: ', lessonData[4].su);

        // console.log('allSubjects: ', await getAllSubjects(untis));

        // console.log('lessonData: ', lessonData);

        allLessons = (await lessonData.map((lesson: any) => {
            return mapToLessonModel(lesson);
        })) as LessonModel[];

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
        const { id: teacherId, orgid, orgname, dids, ...rest } = item;
        let newObject = { teacherId, ...rest };
        if (orgid) {
            newObject.teacherId = orgid;
        }
        if (orgname) {
            newObject.name = orgname;
        }
        return newObject;
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

function mapToRoomModel(obj: RoomModel) {
    return {
        roomId: obj.id,
        name: obj.name,
        longName: obj.longName,
    };
}

function mapToSubjectModel(obj: SubjectModel) {
    return {
        subjectId: obj.id,
        name: obj.name,
        longName: obj.longName,
        alternateName: obj.alternateName,
        active: obj.active,
    };
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

    // if (obj.id === 1368456) {
    //     console.log('obj: ', obj);
    // }

    return {
        lessonId: obj.id,
        lessonCode: obj.code || 'Unterricht',
        date: formattedDate,
        startTime: String(obj.startTime),
        endTime: String(obj.endTime),
        lessonState: obj.lessonState || 'Some State',
        rescheduleInfo: obj.rescheduleInfo || null,
        classId: obj.classId || 1,
        kl: obj.kl || [],
        teacher: obj.te || [],
        ro: obj.ro || [],
        subject: obj.su || [],
        sg: obj.sg || '',
    };
};

function convertTimeToDate(time: number, date: Date): Date {
    const hours = Math.floor(time / 100);
    const minutes = time % 100;
    const newDate = new Date(date.getTime());
    newDate.setHours(hours, minutes, 0, 0);
    return newDate;
}
async function saveLessonsToDB(
    modelName: string,
    uniqueIdentifier: string,
    data: any[]
): Promise<void> {
    try {
        for (const item of data) {
            // console.log('item: ', item);
            // console.log('item.kl: ', item.kl);

            // Extract kl, teacher, class, room, and subject data and remove them from item
            const klData = item.kl;
            delete item.kl;

            let teacherData = item.teacher;

            if (item.teacher[0].orgid && item.teacher[0].orgname) {
                // console.log('teacherData: ', teacherData);
                // console.log('!!!!!!!!!!!!!!!!!!!!!!!!');
                teacherData[0].name = item.teacher[0].orgname;
                teacherData[0].id = item.teacher[0].orgid;
            }
            delete item.teacher;

            // console.log('teacherData: ', teacherData);

            const classData = klData[0].id; // Assuming classId is the id of the first kl object
            delete item.classId; // If classId is a property of item, delete it

            let roomData;
            if (item.ro && item.ro.length > 0) {
                roomData = item.ro[0].id; // Assuming roomId is the id of the first ro object
                delete item.roomId; // If roomId is a property of item, delete it
            }
            delete item.ro; // Always delete ro from item

            let subjectData;
            if (item.subject && item.subject.length > 0) {
                subjectData = item.subject[0].id; // Assuming subjectId is the id of the first subject object
                delete item.subjectId; // If subjectId is a property of item, delete it
            }
            delete item.subject; // Always delete subject from item

            // console.log('###########: ', item);

            // First, upsert the Lesson
            const upsertedLesson = await prisma[modelName].upsert({
                where: { [uniqueIdentifier]: item[uniqueIdentifier] },
                update: {
                    ...item,
                    teacherId: teacherData[0].id,
                    classId: classData,
                    roomId: roomData,
                    subjectId: subjectData,
                },
                create: {
                    ...item,
                    class: {
                        connect: {
                            classId: classData,
                        },
                    },
                    teacher: {
                        connect: {
                            teacherId: teacherData[0].id,
                        },
                    },
                    ...(roomData && {
                        room: {
                            connect: {
                                roomId: roomData,
                            },
                        },
                    }),
                    ...(subjectData && {
                        subject: {
                            connect: {
                                subjectId: subjectData,
                            },
                        },
                    }),
                },
            });
        }
        console.log('Data saved successfully!!');
    } catch (error) {
        console.error(
            `An error occurred while saving the data to ${modelName}:`,
            error
        );
    }
}

interface LessonModel {
    lessonId: number;
    lessonCode: string;
    date: Date;
    startTime: string;
    endTime: string;
    lessonState: string;
    rescheduleInfo: null | RescheduleInfo;
    classId: number;
    kl: any[];
    teacher: any[];
    ro: any[];
    subject: any[];
    sg: string;
}

interface RoomModel {
    id: string;
    roomId: number;
    name: string;
    longName: string;
    lessons: any[];
}

interface SubjectModel {
    id: string;
    subjectId: number;
    name: string;
    longName: string;
    alternateName: string;
    active: boolean;
}

interface RescheduleInfo {
    // Define the properties of RescheduleInfo interface here
}
