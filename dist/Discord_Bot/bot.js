import { Client } from "discord.js";
import { config } from "./config.js";
import { commands } from "./commands/index.js";
import { deployCommands } from "./deploy-commands.js";
export function startBot() {
    const client = new Client({
        intents: ["Guilds", "GuildMessages", "DirectMessages"],
    });
    client.once("ready", () => {
        console.log("Discord bot is ready! 🤖");
    });
    client.once("ready", async () => {
        // Get all guilds the bot is connected to
        const guilds = client.guilds.cache;
        // Deploy commands to all guilds
        guilds.forEach(async (guild) => {
            await deployCommands({ guildId: guild.id });
        });
        console.log("Bot is ready and commands have been deployed to all guilds.");
    });
    client.on("guildCreate", async (guild) => {
        await deployCommands({ guildId: guild.id });
    });
    client.on("interactionCreate", async (interaction) => {
        if (!interaction.isCommand()) {
            return;
        }
        const { commandName } = interaction;
        if (commands[commandName]) {
            commands[commandName].execute(interaction);
        }
    });
    client.login(config.DISCORD_TOKEN);
}
//# sourceMappingURL=bot.js.map