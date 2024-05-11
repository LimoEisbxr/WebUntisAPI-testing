import { readDB } from '../../Database/databaseFunctions.js';

interface ClassItem {
    className: string;
    [key: string]: any; // for other properties of item
}

interface Choice {
    name: string;
    value: string;
}

export async function getAutocompleteChoices(): Promise<Choice[]> {
    const classes: ClassItem[] = await readDB('Class');

    // console.log('Classes:', classes);

    const choices: Choice[] = classes.map((item) => {
        // console.log('Mapping item:', item);
        return {
            name: item.className.toLowerCase(),
            value: item.className.toLowerCase(),
        };
    });

    // console.log('Choices:', choices);

    return choices;
}
