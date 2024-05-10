import { ButtonInteraction, EmbedBuilder } from "discord.js";
import { WebUntis } from "webuntis";
import { getUntisUserData } from "../../Database/databaseFunctions.js";
import { getTimeTableForDate } from "../../WebUntisAPI/APIFunctions.js";
import { mergeLessons } from "../../WebUntisAPI/dataFormatting.js";

export async function handleLessonButton(interaction: ButtonInteraction) {
    const buttonId = interaction.customId;
    const discordId = interaction.user.id;
    const username = interaction.user.username;
    const subjectId = buttonId.split("-")[1];
    const dateString = buttonId.split("-")[2]; // new Date("20220101")
    const date = new Date(
        parseInt(dateString.slice(0, 4)),
        parseInt(dateString.slice(4, 6)) - 1,
        parseInt(dateString.slice(6, 8))
    );

    const user = await getUntisUserData(discordId);
    const untis = new WebUntis(
        user.untisSchoolName,
        user.untisUsername,
        user.untisPassword,
        user.untisUrl
    );

    let timetable = await getTimeTableForDate(untis, date);
    timetable = await mergeLessons(timetable);
    const lesson = timetable.find((lesson) => lesson.id === Number(subjectId));

    if (!lesson) {
        await interaction.update({
            content: `Lesson for subject ${subjectId} not found. ${buttonId}`,
        });
        return;
    }

    // Create a new embed message
    const embed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle(`Lesson Details for ${lesson.su[0].longname}`)
        .setDescription(`Details for the lesson clicked by ${username}`)
        .addFields(
            { name: "Date", value: date.toDateString() },
            { name: "Time", value: `${lesson.startTime} - ${lesson.endTime}` },
            { name: "Teacher", value: `${lesson.te[0].longname}` }
        );

    // Filter out existing detail embeds
    const existingEmbeds = interaction.message.embeds.filter(
        (embed) => embed.title && !embed.title.startsWith("Lesson Details for")
    );

    // Handle button click here
    // For example, reply with the name of the subject
    await interaction.update({
        embeds: [...existingEmbeds, embed], // Add the new embed message to the existing ones
    });
}
