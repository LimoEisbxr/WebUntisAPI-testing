import { WebUntis } from 'webuntis';
import { PrismaClient } from '@prisma/client';

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
