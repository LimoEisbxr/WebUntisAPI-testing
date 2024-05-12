import {
    CommandInteraction,
    SlashCommandBuilder,
    CommandInteractionOptionResolver,
} from 'discord.js';
import { WebUntis } from 'webuntis';
import { updateDB } from '../../WebUntisAPI/DBUpdater.js';

export const data = new SlashCommandBuilder()
    .setName('init')
    .setDescription('Init is needed to start the Bot. Nothing is saved.')
    .addStringOption((option) =>
        option
            .setName('username')
            .setDescription('Your WebUntis username. (MaxiMust6969)')
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName('password')
            .setDescription('Your WebUntis password. (WalziWalzWalz!!)')
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName('schoolname')
            .setDescription(
                'The webuntis school id you are attending. default: hhg-zw'
            )
            .setRequired(false)
    )
    .addStringOption((option) =>
        option
            .setName('schoolurl')
            .setDescription(
                'The URL of the webuntis server. default: herakles.webuntis.com'
            )
            .setRequired(false)
    );

export async function execute(interaction: CommandInteraction) {
    const username = (
        interaction.options as CommandInteractionOptionResolver
    ).getString('username');

    const password = (
        interaction.options as CommandInteractionOptionResolver
    ).getString('password');

    const schoolName = (
        interaction.options as CommandInteractionOptionResolver
    ).getString('schoolName');

    const schoolURL = (
        interaction.options as CommandInteractionOptionResolver
    ).getString('schoolURL');

    if (!username || !password) {
        await interaction.reply({
            content: 'Please provide a username and a password.',
            ephemeral: true,
        });
        return;
    }

    const defaultSchoolName = 'hhg-zw'; // replace with your default school name
    const defaultSchoolURL = 'herakles.webuntis.com'; // replace with your default school URL

    const untis = new WebUntis(
        schoolName || defaultSchoolName,
        username,
        password,
        schoolURL || defaultSchoolURL
    );

    try {
        await untis.login();
        await untis.logout();
    } catch (error) {
        await interaction.reply({
            content: 'Username or Password incorrect.',
            ephemeral: true,
        });
        return;
    }

    await interaction.reply({
        content: 'Successfully logged in! Fetching data...',
        ephemeral: true,
    });

    updateDB(untis);
}
