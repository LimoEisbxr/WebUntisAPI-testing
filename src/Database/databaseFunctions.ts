import { WebUntis } from 'webuntis';
import { Class, PrismaClient, UntisUser } from '@prisma/client';

export const prisma = new PrismaClient() as any;

export async function getUntisUserData(discordId: string) {
    return prisma.untisUser.findUniqueOrThrow({
        where: {
            discordId: discordId,
        },
        select: {
            untisSchoolName: true,
            untisUsername: true,
            untisPassword: true,
            untisUrl: true,
        },
    });
}
export async function getRandomPrimaryUser(): Promise<any | boolean> {
    // find all primary users
    const primaryUsers = await prisma.primaryUser.findMany({
        select: {
            UntisUser: {
                select: {
                    untisSchoolName: true,
                    untisUsername: true,
                    untisPassword: true,
                    untisUrl: true,
                },
            },
        },
    });

    // return false if there are no primary users
    if (primaryUsers.length === 0) {
        return false;
    }

    // get random primary user
    return primaryUsers[Math.floor(Math.random() * primaryUsers.length)];
}

export async function saveToDB(
    modelName: string,
    uniqueIdentifier: string,
    data: any[]
): Promise<void> {
    try {
        for (const item of data) {
            await prisma[modelName].upsert({
                where: { [uniqueIdentifier]: item[uniqueIdentifier] },
                update: item,
                create: item,
            });
        }
        console.log('Data saved successfully');
    } catch (error) {
        console.error(
            `An error occurred while saving the data to ${modelName}:`,
            error
        );
    }
}

export async function getAllEntries(modelName: string): Promise<any[]> {
    return prisma[modelName].findMany();
}

export async function getAllUntisAccounts(
    onlyDifferentClasses: boolean = false
): Promise<any[]> {
    if (onlyDifferentClasses) {
        return prisma.untisUser.findMany({
            distinct: ['untisSchoolName'],
        });
    } else {
        return prisma.untisUser.findMany();
    }
}

export async function readDB(modelName: string): Promise<any[]> {
    return prisma[modelName].findMany();
}

export async function getDataFromTableByKey(
    modelName: string,
    uniqueKey: string,
    keyValue: any
): Promise<any[]> {
    return prisma[modelName].findMany({
        where: {
            [uniqueKey]: keyValue,
        },
    });
}

export async function getTeacherData(teacherId: number): Promise<any> {
    return prisma.teacher.findUnique({
        where: {
            teacherId: teacherId,
        },
    });
}

export async function getAllRegisteredClasses(): Promise<Class[]> {
    return prisma.class.findMany({
        where: {
            untisUser: {
                some: {},
            },
        },
        include: {
            untisUser: true,
        },
    });
}

export async function getAllUsersWithLessonNotifierDaily(): Promise<
    UntisUser[]
> {
    // console.log('Getting all users with lessonNotifierDaily');
    return prisma.untisUser.findMany({
        where: {
            lessonNotifierDaily: {
                isNot: null,
            },
        },
        include: {
            lessonNotifierDaily: true,
            primaryUser: true,
            class: true,
        },
    });
}
