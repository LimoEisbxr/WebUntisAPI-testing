import { EmbedBuilder } from 'discord.js';
import { client } from '../../index.js';

export async function pingUserInDm(userID: string, message: string) {
    try {
        const user = await client.users.fetch(userID);
        if (user) {
            await user.send(message);
        } else {
            console.log(`User with ID: ${userID} not found.`);
        }
    } catch (error) {
        console.error(`Failed to send DM: ${error}`);
    }
}

export async function createNextLessonMessage(
    userID: string,
    heading: string,
    data: [string, string][]
) {
    const tableRows = data.map(([heading, value]) => `${heading}: ${value}`);
    const table = tableRows.join('\n');

    const messageContent = `${heading}\n${table}`;

    const user = await client.users.fetch(userID);

    user.send(messageContent);
}
