import {
    CommandInteraction,
    SlashCommandBuilder,
    CommandInteractionOptionResolver,
} from "discord.js";
import { WebUntis } from "webuntis";
import { getUntisUserData } from "../../Database/databaseFunctions.js";
import { getTimeTableForDate } from "../../WebUntisAPI/APIFunctions.js";

export const data = new SlashCommandBuilder()
    .setName("createlessonnotifier")
    .setDescription("Create a lesson notifier.")
    .addNumberOption((option) =>
        option
            .setName("lessonstart")
            .setDescription("The start time of the lesson.")
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName("lessondate")
            .setDescription("The date of the lesson.")
            .setRequired(true)
    )
    .addNumberOption((option) =>
        option
            .setName("notifytimeoffset")
            .setDescription(
                "Time Offset of the notification to the start of the lesson."
            )
            .setRequired(true)
    );

export async function execute(interaction: CommandInteraction) {
    const lessonStart = (
        interaction.options as CommandInteractionOptionResolver
    ).getNumber("lessonstart");

    const lessonDateStr = (
        interaction.options as CommandInteractionOptionResolver
    ).getString("lessondate");
    const lessonDate = new Date(lessonDateStr);

    const notifyTimeOffset = (
        interaction.options as CommandInteractionOptionResolver
    ).getNumber("notifytimeoffset");

    let untis;
    try {
        const user = await getUntisUserData(interaction.user.id);
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
        untis.login();
    } catch (error) {
        await interaction.reply({
            content: "Error logging in to WebUntis.",
            ephemeral: true,
        });
        return;
    }

    try {
        const timetable = await getTimeTableForDate(untis, lessonDate);

        if (timetable.length === 0) {
            await interaction.reply({
                content: "You don't have any lessons that day.",
                ephemeral: true,
            });
            return;
        }

        const lesson = timetable.find(
            (lesson) => lesson.startTime === lessonStart
        );

        if (!lesson) {
            await interaction.reply({
                content: "No lesson found at that date and that time.",
                ephemeral: true,
            });
            return;
        }
    } catch (error) {
        await interaction.reply({
            content: "Error getting timetable.",
            ephemeral: true,
        });
        return;
    }
}
