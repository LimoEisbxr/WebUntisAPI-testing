import { Lesson } from "webuntis";
import {
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle,
    ActionRowData,
    MessageActionRowComponentBuilder,
    MessageActionRowComponentData,
} from "discord.js";

export async function generateActionRow(
    timetable: Lesson[]
): Promise<
    ActionRowData<
        MessageActionRowComponentBuilder | MessageActionRowComponentData
    >[]
> {
    // build action row
    let actionRows: ActionRowBuilder[] = [];
    let button_list: ButtonBuilder[] = [];

    timetable.forEach((lesson, index) => {
        let button = new ButtonBuilder()
            .setLabel(lesson.su[0].name)
            .setCustomId(lesson.id.toString())
            .setStyle(ButtonStyle.Primary);

        button_list.push(button);

        // If we have 5 buttons or this is the last lesson, create a new action row
        if (button_list.length === 5 || index === timetable.length - 1) {
            let actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
                ...button_list
            );
            actionRows.push(actionRow);
            button_list = []; // Reset the button list for the next row
        }
    });

    const actionRowData = actionRows.map((actionRow) =>
        actionRow.toJSON()
    ) as ActionRowData<
        MessageActionRowComponentBuilder | MessageActionRowComponentData
    >[];

    return actionRowData;
}
