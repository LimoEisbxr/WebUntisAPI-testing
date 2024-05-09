import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { WebUntis } from "webuntis";
import { prisma } from "./index.js";
import { getTimetableForToday } from "../../WebUntisAPI/APIFunctions.js";

export const data = new SlashCommandBuilder()
    .setName("timetabletoday")
    .setDescription("Get your timetable for today.");

export async function execute(interaction: CommandInteraction) {
    let user;
    try {
        user = await prisma.untisUser.findUniqueOrThrow({
            where: {
                discordId: interaction.user.id,
            },
            select: {
                untisSchoolName: true,
                untisUsername: true,
                untisPassword: true,
                untisUrl: true,
            },
        });
    } catch (error) {
        await interaction.reply({
            content: "You need to login first using /login.",
            ephemeral: true,
        });
        return;
    }

    const untis = new WebUntis(
        user.untisSchoolName,
        user.untisUsername,
        user.untisPassword,
        user.untisUrl
    );

    try {
        await untis.login();
    } catch (error) {
        await interaction.reply({
            content: "Error logging in to WebUntis.",
            ephemeral: true,
        });
        return;
    }
    try {
        const timetable_today = await getTimetableForToday(untis);

        if (timetable_today.length === 0) {
            await interaction.reply({
                content: "You have no lessons today.",
                ephemeral: true,
            });
            return;
        }

        let response = "Your timetable for today:\n";
        timetable_today.forEach((lesson) => {
            response += `${lesson.startTime} - ${lesson.endTime}: ${lesson.code} - ${lesson.su}\n`;
        });

        await interaction.reply({
            content: response,
            ephemeral: true,
        });
    } catch (error) {
        await interaction.reply({
            content: "Error getting timetable.",
            ephemeral: true,
        });
    } finally {
        await untis.logout();
    }
}
