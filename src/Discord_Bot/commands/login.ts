import {
    CommandInteraction,
    SlashCommandBuilder,
    CommandInteractionOptionResolver,
} from 'discord.js';
import { prisma } from './index.js';
import { WebUntis } from 'webuntis';
import { getAutocompleteChoices } from '../handlers/handleAutocompleteChoices.js';

export const data = new SlashCommandBuilder()
    .setName('login')
    .setDescription('Login to WebUntis.')
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
            .setName('class')
            .setDescription('The class you are attending. (10b)')
            .setRequired(true)
            .setAutocomplete(true)
    )
    .addStringOption((option) =>
        option
            .setName('schoolname')
            .setDescription('The school you are attending. default: hhg-zw')
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

    const className = (
        interaction.options as CommandInteractionOptionResolver
    ).getString('class');

    const schoolName = (
        interaction.options as CommandInteractionOptionResolver
    ).getString('schoolName');

    const schoolURL = (
        interaction.options as CommandInteractionOptionResolver
    ).getString('schoolURL');

    if (!username || !password || !className) {
        await interaction.reply({
            content: 'Please provide a username, password and class.',
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

    // check if the className is valid

    const choices = await getAutocompleteChoices();

    if (!choices.map((choice) => choice.name).includes(className)) {
        await interaction.reply({
            content: 'Please provide a valid class name.',
            ephemeral: true,
        });
        return;
    }

    try {
        await prisma.$connect();

        // Upsert the user
        await prisma.untisUser.upsert({
            where: { discordId: interaction.user.id },
            create: {
                discordId: interaction.user.id,
                discordUsername: interaction.user.username,
                untisUsername: username,
                untisPassword: password,
                untisSchoolName: schoolName || defaultSchoolName,
                untisUrl: schoolURL || defaultSchoolURL,
            },
            update: {
                discordUsername: interaction.user.username,
                untisUsername: username,
                untisPassword: password,
                untisSchoolName: schoolName || defaultSchoolName,
                untisUrl: schoolURL || defaultSchoolURL,
            },
        });

        // Fetch the class
        const classToConnect = await prisma.class.findUnique({
            where: { className: className },
        });

        if (!classToConnect) {
            throw new Error(`Class with name ${className} not found`);
        }

        // Connect the class to the user
        await prisma.untisUser.update({
            where: { discordId: interaction.user.id },
            data: {
                class: {
                    connect: { className: className },
                },
            },
        });

        await prisma.$disconnect();
    } catch (error) {
        console.error(error);
        await interaction.reply({
            content: 'An error occurred while trying to save your data.',
            ephemeral: true,
        });
        return;
    }

    await interaction.reply({
        content: 'Successfully logged in to WebUntis API!',
        ephemeral: true,
    });
}
