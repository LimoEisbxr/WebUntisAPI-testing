import {
    CommandInteraction,
    CommandInteractionOptionResolver,
    SlashCommandBuilder,
} from 'discord.js';
import { checkIfVarIsValid, setVarToDefaultIfNotValid } from '../../utils.js';
import { prisma } from './index.js';

export const data = new SlashCommandBuilder()
    .setName('setupprehournotify')
    .setDescription('Setup a notification for the next hour.')
    .addBooleanOption((option) =>
        option
            .setName('perdm')
            .setDescription('Send the message per DM. Default: true')
            .setRequired(false)
    )
    .addChannelOption((option) =>
        option
            .setName('channel')
            .setDescription(
                'The channel to send the message to. Default: current channel if perDM is false'
            )
            .setRequired(false)
    )
    .addBooleanOption((option) =>
        option
            .setName('onlyinbreak')
            .setDescription('Only send the message in breaks. Default: true')
            .setRequired(false)
    )
    .addIntegerOption((option) =>
        option
            .setName('offset')
            .setDescription('The offset in minutes. Default: 0')
            .setRequired(false)
    );

export async function execute(interaction: CommandInteraction) {
    let sendPerDM = (
        interaction.options as CommandInteractionOptionResolver
    ).getBoolean('perDM');

    let channel: any = (
        interaction.options as CommandInteractionOptionResolver
    ).getChannel('channel');

    let onlyInBreak = (
        interaction.options as CommandInteractionOptionResolver
    ).getBoolean('onlyInBreak');

    let offset = (
        interaction.options as CommandInteractionOptionResolver
    ).getInteger('offset');

    // console.log('typeof channel:', typeof channel);
    // console.log('typeof interaction.channel:', typeof interaction.channel);
    // console.log('channel constructor:', channel?.constructor.name);
    // console.log(
    //     'interaction.channel constructor:',
    //     interaction.channel?.constructor.name
    // );

    sendPerDM = setVarToDefaultIfNotValid(sendPerDM, true);

    channel = setVarToDefaultIfNotValid(channel, interaction.channel);

    onlyInBreak = setVarToDefaultIfNotValid(onlyInBreak, true);

    offset = setVarToDefaultIfNotValid(offset, 0);

    try {
        sendPerDM = setVarToDefaultIfNotValid(sendPerDM, true);
        channel = setVarToDefaultIfNotValid(channel, interaction.channel);
        onlyInBreak = setVarToDefaultIfNotValid(onlyInBreak, true);
        offset = setVarToDefaultIfNotValid(offset, 0);

        await prisma.$connect();

        await prisma.lessonNotifierDaily.upsert({
            where: { discordId: interaction.user.id },
            update: {
                perDM: sendPerDM,
                channelId: channel.id,
                guildId: interaction.guildId,
                onlyInBreak: onlyInBreak,
                offset: offset,
                UntisUser: {
                    connect: { discordId: interaction.user.id },
                },
            },
            create: {
                discordId: interaction.user.id,
                perDM: sendPerDM,
                channelId: channel.id,
                guildId: interaction.guildId,
                onlyInBreak: onlyInBreak,
                offset: offset,
            },
        });

        await prisma.$disconnect();
    } catch (error) {
        console.error(error);
        return interaction.reply({
            content: 'An error occurred while trying to save your data.',
            ephemeral: true,
        });
    }

    // Implement your notification setup logic here using the options above

    return interaction.reply({
        content: 'Notification setup complete!',
        ephemeral: true,
    });
}

// model lessonNotifierDaily {
//     id          String    @id @default(cuid())
//     UntisUser   UntisUser @relation(fields: [discordId], references: [discordId])
//     discordId   String    @unique
//     perDM       Boolean?
//     channelId   String
//     guildId     String?
//     onlyInBreak Boolean?
//     offset      Int?
// }
