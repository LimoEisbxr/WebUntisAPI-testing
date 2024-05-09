import { prisma } from "../Discord_Bot/commands/index.js";
export async function getUntisUserData(discordId) {
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
//# sourceMappingURL=databaseFunctions.js.map