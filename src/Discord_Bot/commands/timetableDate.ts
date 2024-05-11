import {
    CommandInteraction,
    SlashCommandBuilder,
    CommandInteractionOptionResolver,
    EmbedBuilder,
    ComponentType,
} from "discord.js";
import { WebUntis } from "webuntis";
import { getTimeTableForDate } from "../../WebUntisAPI/APIFunctions.js";
import { getUntisUserData } from "../../Database/databaseFunctions.js";
import { mergeLessons } from "../../WebUntisAPI/dataFormatting.js";
import { generateActionRow } from "../../Discord_Bot/Utility/lessonsActionRow.js";
import { formatUntisTime } from "../Utility/formatters.js";

export const data = new SlashCommandBuilder()
    .setName("timetabledate")
    .setDescription("Get your timetable for today.")
    .addStringOption((option) =>
        option
            .setName("date")
            .setDescription(
                "The date you want to get the timetable for. (YYYY-MM-DD)"
            )
            .setRequired(true)
    );

export async function execute(interaction: CommandInteraction) {
    let untis;

    const date = (
        interaction.options as CommandInteractionOptionResolver
    ).getString("date");

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
        if (date === null) {
            await interaction.reply({
                content: "Date is not provided.",
                ephemeral: true,
            });
            return;
        }

        let timetable_today = await getTimeTableForDate(untis, new Date(date));

        if (timetable_today.length === 0) {
            await interaction.reply({
                content: "You have no lessons at that day.",
                ephemeral: true,
            });
            return;
        }

        timetable_today = await mergeLessons(timetable_today);

        // build embed
        let response = `Your timetable for ${date}:\n\n`;
        let table = "";

        let titleStartTime = "START".padEnd(5, " ");
        let titleEndTime = "END".padEnd(5, " ");
        let titleSubject = "SUBJECT".padEnd(10, " ");
        let titleTeachers = "TEACHER".padEnd(15, " ");

        let tableRows = [];
        tableRows.push(
            `${titleStartTime}  ${titleEndTime}  ${titleSubject}  ${titleTeachers}`
        );

        for (const lesson of timetable_today) {
            let teacher = lesson.te[0].longname;

            // Convert time to string, insert colon at appropriate position
            let startTime = await formatUntisTime(lesson.startTime.toString());
            let endTime = await formatUntisTime(lesson.endTime.toString());

            let subject = lesson.su[0].name;
            tableRows.push(
                `${startTime.padEnd(5, " ")}  ${endTime.padEnd(
                    5,
                    " "
                )}  ${subject.padEnd(10, " ")}  ${teacher.padEnd(15, " ")}`
            );
        }

        table = tableRows.join("\n");

        let embed = new EmbedBuilder()
            .setTitle(response)
            .setDescription(`\`\`\`${table}\`\`\``)
            .setColor("#0099ff");

        let actionRowData = await generateActionRow(timetable_today);
        await interaction.reply({
            embeds: [embed],
            ephemeral: true,
            components: actionRowData,
        });
    } catch (error) {
        console.log(error);
        await interaction.reply({
            content: "Error getting timetable.",
            ephemeral: true,
        });
    } finally {
        await untis.logout();
    }
}
