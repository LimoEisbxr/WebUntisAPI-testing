import { SlashCommandBuilder, } from "discord.js";
export const data = new SlashCommandBuilder()
    .setName("createlessonnotifier")
    .setDescription("Create a lesson notifier.")
    .addNumberOption((option) => option
    .setName("lessonstart")
    .setDescription("The start time of the lesson.")
    .setRequired(true))
    .addNumberOption((option) => option
    .setName("notifytimeoffset")
    .setDescription("Time Offset of the notification to the start of the lesson.")
    .setRequired(true));
export async function execute(interaction) {
    const lessonStart = interaction.options.getString("lessonstart");
    const notifyTimeOffset = interaction.options.getString("notifytimeoffset");
}
//# sourceMappingURL=createLessonNotifier.js.map