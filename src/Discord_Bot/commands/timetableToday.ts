import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { WebUntis } from "webuntis";
import { getTimetableForToday } from "../../WebUntisAPI/APIFunctions.js";
import { getUntisUserData } from "../../Database/databaseFunctions.js";

export const data = new SlashCommandBuilder()
    .setName("timetabletoday")
    .setDescription("Get your timetable for today.");

export async function execute(interaction: CommandInteraction) {
    let untis;
    try {
        let user = await getUntisUserData(interaction.user.id);
        untis = new WebUntis(
            user.untisSchoolName,
            user.untisUsername,
            user.untisPassword,
            user.untisUrl
        );
    } catch (error) {
        await interaction.reply({
            content: "You need to login first using /login.",
            ephemeral: true,
        });
        return;
    }

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
