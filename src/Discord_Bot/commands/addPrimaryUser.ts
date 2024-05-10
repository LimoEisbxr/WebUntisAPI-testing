import {
    CommandInteraction,
    SlashCommandBuilder,
    CommandInteractionOptionResolver,
} from 'discord.js';
import { prisma } from './index.js';
import { checkIfVarIsValid, setVarToDefaultIfNotValid } from '../../utils.js';

export const data = new SlashCommandBuilder()
    .setName('primaryuser')
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
        await removePrimaryUser(interaction.user.id);
        await interaction.reply({
            content: 'You have been removed as a primary user.',
            ephemeral: true,
        });
    } else {
        await createPrimaryUser(interaction.user.id);
        await interaction.reply({
            content: 'You have been added as a primary user.',
            ephemeral: true,
        });
    }
}

async function createPrimaryUser(discordId: string) {
    if (discordId === null || discordId === undefined) {
        throw new Error('Discord ID is not valid.');
    }
    const newUser = await prisma.primaryUser.upsert({
        where: { discordId: discordId },
        update: { discordId: discordId },
        create: {
            discordId: discordId,
            // Assuming UntisUser is a relation field
        },
    });

    return newUser;
}

async function removePrimaryUser(discordId: string) {
    if (discordId === null || discordId === undefined) {
        throw new Error('Discord ID is not valid.');
    }
    const removedUser = await prisma.primaryUser.deleteMany({
        where: {
            discordId: discordId,
        },
    });

    return removedUser;
}
