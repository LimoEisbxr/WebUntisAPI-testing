import {
    CacheType,
    CommandInteraction,
    CommandInteractionOptionResolver,
    SlashCommandBuilder,
} from 'discord.js';
import { prisma } from '../../index.js';
import { encrypt, decrypt } from '../../Misc/encryption.js';
import { sendWakeOnLanPacket } from '../../Misc/wol.js';

export const data = new SlashCommandBuilder()
    .setName('wolremote')
    .setDescription('Wakes your PC up remotely.')
    .addSubcommandGroup((group) =>
        group
            .setName('subcommands')
            .setDescription('Wake your PC up.')
            .addSubcommand((subcommand) =>
                subcommand.setName('pc').setDescription('Wake your PC up.')
            )
            .addSubcommand((subcommand) =>
                subcommand
                    .setName('config')
                    .setDescription('Save your WOL configuration.')
                    .addStringOption((option) =>
                        option
                            .setName('sshhost')
                            .setDescription(
                                'The SSH host / IP of the target PC.'
                            )
                            .setRequired(true)
                    )
                    .addIntegerOption((option) =>
                        option
                            .setName('sshport')
                            .setDescription('The SSH port of the target PC.')
                            .setRequired(false)
                    )
                    .addStringOption((option) =>
                        option
                            .setName('sshuser')
                            .setDescription('The SSH user of the target PC.')
                            .setRequired(true)
                    )
                    .addStringOption((option) =>
                        option
                            .setName('sshkey')
                            .setDescription(
                                'The SSH key path of the target PC.'
                            )
                            .setRequired(true)
                    )
                    .addStringOption((option) =>
                        option
                            .setName('targetmac')
                            .setDescription('The MAC address of the target PC.')
                            .setRequired(true)
                    )
            )
            .addSubcommand((subcommand) =>
                subcommand
                    .setName('remove')
                    .setDescription('Remove your WOL configuration.')
            )
    );

async function handleWakePC(interaction: CommandInteraction) {
    const user = await prisma.WoLRemoteUser.findUnique({
        where: { discordId: interaction.user.id },
    });

    if (!user) {
        await interaction.reply('No WOL configuration found for your account.');
        return;
    }

    const decryptedMac = decrypt(user.targetmac);

    try {
        await sendWakeOnLanPacket(decryptedMac);
        await interaction.reply(`WOL packet sent to ${decryptedMac}.`);
    } catch (error) {
        await interaction.reply(
            'Failed to send WOL packet. Please try again later.'
        );
    }
}

async function saveWoLConfig(interaction: CommandInteraction) {
    const sshHost = (
        interaction.options as CommandInteractionOptionResolver<CacheType>
    ).getString('sshhost', true);
    let sshPort = (
        interaction.options as CommandInteractionOptionResolver<CacheType>
    ).getInteger('sshport');

    // check if the ssh port is set || if not, set it to 22
    sshPort = sshPort || 22;

    const sshUser = (
        interaction.options as CommandInteractionOptionResolver<CacheType>
    ).getString('sshuser', true);
    const sshKey = (
        interaction.options as CommandInteractionOptionResolver<CacheType>
    ).getString('sshkey', true);
    const targetMac = (
        interaction.options as CommandInteractionOptionResolver<CacheType>
    ).getString('targetmac', true);

    const encryptedSshHost = encrypt(sshHost);
    const encryptedSshUser = encrypt(sshUser);
    const encryptedSshKey = encrypt(sshKey);
    const encryptedTargetMac = encrypt(targetMac);

    await prisma.WoLRemoteUser.upsert({
        where: { discordId: interaction.user.id },
        update: {
            sshhost: encryptedSshHost,
            sshport: sshPort,
            sshuser: encryptedSshUser,
            sshkey: encryptedSshKey,
            targetmac: encryptedTargetMac,
        },
        create: {
            discordId: interaction.user.id,
            sshhost: encryptedSshHost,
            sshport: sshPort,
            sshuser: encryptedSshUser,
            sshkey: encryptedSshKey,
            targetmac: encryptedTargetMac,
        },
    });

    await interaction.reply('Your WOL configuration has been saved.');
}

async function removeWoLConfig(interaction: CommandInteraction) {
    const user = await prisma.WoLRemoteUser.findUnique({
        where: { discordId: interaction.user.id },
    });

    if (!user) {
        await interaction.reply('You have not saved any WOL configuration.');
        return;
    }

    await prisma.WoLRemoteUser.delete({
        where: { discordId: interaction.user.id },
    });

    await interaction.reply('Your WOL configuration has been removed.');
}

export async function execute(interaction: CommandInteraction) {
    if (!interaction.isCommand()) return;

    const commandName = interaction.commandName;

    if (commandName === 'wolremote') {
        const subcommandGroup = (
            interaction.options as CommandInteractionOptionResolver<CacheType>
        ).getSubcommandGroup();
        const subcommand = (
            interaction.options as CommandInteractionOptionResolver<CacheType>
        ).getSubcommand();

        if (subcommandGroup === 'subcommands') {
            if (subcommand === 'pc') {
                await handleWakePC(interaction);
                return;
            } else if (subcommand === 'config') {
                await saveWoLConfig(interaction);
                return;
            } else if (subcommand === 'remove') {
                await removeWoLConfig(interaction);
                return;
            }

            await interaction.reply('Invalid subcommand.');
        }
    }

    await interaction.reply({ content: 'Invalid command.', ephemeral: true });
}