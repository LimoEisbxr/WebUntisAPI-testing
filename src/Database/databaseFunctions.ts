import { prisma } from "../Discord_Bot/commands/index.js";

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
