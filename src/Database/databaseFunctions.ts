import { WebUntis } from 'webuntis';
import { prisma } from '../Discord_Bot/commands/index.js';

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
