import { AutocompleteInteraction, Interaction } from 'discord.js';
import { getAutocompleteChoices } from './handleAutoCompleteChoices.js';

export async function handleAutocomplete(interaction: any) {
    console.log('Autocomplete Interaction');
    const choices = await getAutocompleteChoices();

    // console.log('Choices:', choices);

    // console.log('Interaction:', interaction.commandName);
    if (interaction.commandName === 'login') {
        // Use the type assertion variable
        const focusedOption = interaction.options.getFocused();

        // console.log('Focused Option:', focusedOption);

        if (typeof focusedOption !== 'string') {
            console.error('focusedOption is not a string:', focusedOption);
            return;
        }

        const filteredOptions = choices.filter((choice: any) => {
            // console.log('Choice:', choice);
            return choice.name
                .toLowerCase()
                .startsWith(focusedOption.toLowerCase());
        });

        // console.log(filteredOptions);

        const results = filteredOptions.map((choice: any) => {
            return {
                name: choice.name,
                value: choice.value,
            };
        });

        // console.log(results);

        interaction.respond(results.slice(0, 25)).catch(() => {});
    }
}
