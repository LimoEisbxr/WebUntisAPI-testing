import { SlashCommandBuilder, EmbedBuilder, } from "discord.js";
import { WebUntis } from "webuntis";
import { getTimeTableForDate, } from "../../WebUntisAPI/APIFunctions.js";
import { getUntisUserData } from "../../Database/databaseFunctions.js";
export const data = new SlashCommandBuilder()
    .setName("timetabledate")
    .setDescription("Get your timetable for today.")
    .addStringOption((option) => option
    .setName("date")
    .setDescription("The date you want to get the timetable for. (YYYY-MM-DD)")
    .setRequired(true));
export async function execute(interaction) {
    const date = interaction.options.getString("date");
    let user = await getUntisUserData(interaction.user.id);
    const untis = new WebUntis(user.untisSchoolName, user.untisUsername, user.untisPassword, user.untisUrl);
    try {
        await untis.login();
    }
    catch (error) {
        await interaction.reply({
            content: "Error logging in to WebUntis.",
            ephemeral: true,
        });
        return;
    }
    try {
        const timetable_today = await getTimeTableForDate(untis, new Date(date));
        if (timetable_today.length === 0) {
            await interaction.reply({
                content: "You have no lessons at that day.",
                ephemeral: true,
            });
            return;
        }
        timetable_today.sort((a, b) => {
            return a.startTime - b.startTime;
        });
        let response = `Your timetable for ${date}:\n\n`;
        let table = "";
        let titleStartTime = "START".padEnd(5, " ");
        let titleEndTime = "END".padEnd(5, " ");
        let titleSubject = "SUBJECT".padEnd(10, " ");
        let titleTeachers = "TEACHER".padEnd(15, " ");
        let tableRows = [];
        tableRows.push(`${titleStartTime}  ${titleEndTime}  ${titleSubject}  ${titleTeachers}`);
        timetable_today.forEach((lesson) => {
            let teachers = lesson.te
                .map((teacher) => teacher.longname)
                .join(", ");
            // Convert time to string, insert colon at appropriate position
            let startTime = lesson.startTime.toString();
            startTime = startTime.slice(0, -2) + ":" + startTime.slice(-2);
            let endTime = lesson.endTime.toString();
            endTime = endTime.slice(0, -2) + ":" + endTime.slice(-2);
            let subject = lesson.su[0].name;
            tableRows.push(`${startTime.padEnd(5, " ")}  ${endTime.padEnd(5, " ")}  ${subject.padEnd(10, " ")}  ${teachers.padEnd(15, " ")}`);
        });
        table = tableRows.join("\n");
        let embed = new EmbedBuilder()
            .setTitle(response)
            .setDescription(`\`\`\`${table}\`\`\``)
            .setColor("#0099ff");
        await interaction.reply({
            embeds: [embed],
            ephemeral: true,
        });
    }
    catch (error) {
        await interaction.reply({
            content: "Error getting timetable.",
            ephemeral: true,
        });
    }
    finally {
        await untis.logout();
    }
}
//# sourceMappingURL=timetableDate.js.map