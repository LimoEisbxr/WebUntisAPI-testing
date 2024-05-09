import { SlashCommandBuilder } from "discord.js";
export const data = new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!");
export async function execute(interaction) {
    return interaction.reply("Pong!");
}
//# sourceMappingURL=ping.js.map