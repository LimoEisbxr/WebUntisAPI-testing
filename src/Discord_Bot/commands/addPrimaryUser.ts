import {
    CommandInteraction,
    SlashCommandBuilder,
    CommandInteractionOptionResolver,
} from 'discord.js';
import { prisma } from './index.js';
import { WebUntis } from 'webuntis';
import { setVarToDefaultIfNotValid } from '../../utils.js';

export const data = new SlashCommandBuilder()
    .setName('primaryUser')
    .setDescription('Add yourself as a primary user.')
    .addBooleanOption((option) =>
        option
            .setName('remove')
            .setDescription('set to true to remove yourself as primary user')
            .setRequired(false)
    );

export async function execute(interaction: CommandInteraction) {
    let remove = (
        interaction.options as CommandInteractionOptionResolver
    ).getBoolean('remove');

    remove = setVarToDefaultIfNotValid(remove, false);

    if (remove) {
        await createPrimaryUser(interaction.user.id);

        await interaction.reply({
            content: 'You have been removed as a primary user.',
            ephemeral: true,
        });
    } else {
        await interaction.reply({
            content: 'You have been added as a primary user.',
            ephemeral: true,
        });
    }
}

async function createPrimaryUser(discordId: string) {
    const newUser = await prisma.primaryUser.create({
        data: {
            discordId: discordId,
            untisUser: {
                connect: {
                    discordId: discordId,
                },
            },
        },
    });

    return newUser;
}
