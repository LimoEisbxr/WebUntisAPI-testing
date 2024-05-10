import { AutocompleteInteraction, Interaction } from 'discord.js';

export async function handleAutocomplete(interaction: any) {
    console.log('Autocomplete Interaction');
    const choices = [
        { name: '5AHIF', value: '5AHIF' },
        { name: '5BHIF', value: '5BHIF' },
        { name: '5CHIF', value: '5CHIF' },
        { name: '5DHIF', value: '5DHIF' },
        { name: '5EHIF', value: '5EHIF' },
        { name: '5FHIF', value: '5FHIF' },
        { name: '5GHIF', value: '5GHIF' },
        { name: '5HHIF', value: '5HHIF' },
        { name: '5IHIF', value: '5IHIF' },
        { name: '5JHIF', value: '5JHIF' },
    ];

    console.log(interaction.commandName);
    if (interaction.commandName === 'login') {
        // Use the type assertion variable
        const focusedOption = interaction.options.getFocused();

        if (typeof focusedOption !== 'string') {
            console.error('focusedOption is not a string:', focusedOption);
            return;
        }

        const filteredOptions = choices.filter((choice) => {
            return choice.name
                .toLowerCase()
                .startsWith(focusedOption.toLowerCase());
        });

        // console.log(filteredOptions);

        const results = filteredOptions.map((choice) => {
            return {
                name: choice.name,
                value: choice.value,
            };
        });

        console.log(results);

        interaction.respond(results.slice(0, 25)).catch(() => {});
    }
}
