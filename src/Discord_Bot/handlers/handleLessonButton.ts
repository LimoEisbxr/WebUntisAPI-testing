import { ButtonInteraction, EmbedBuilder } from 'discord.js';
import { Homework, Lesson, WebUntis } from 'webuntis';
import {
    getUntisUserData,
    getTeacherData,
} from '../../Database/databaseFunctions.js';
import {
    getHomeworksForDate,
    getTimeTableForDate,
} from '../../WebUntisAPI/APIFunctions.js';
import { mergeLessons } from '../../WebUntisAPI/dataFormatting.js';
import { formatUntisTime } from '../Utility/formatters.js';

export async function handleLessonButton(interaction: ButtonInteraction) {
    const buttonId = interaction.customId;
    const discordId = interaction.user.id;
    const username = interaction.user.username;
    const subjectId = buttonId.split('-')[1];
    const dateString = buttonId.split('-')[2]; // new Date("20220101")
    const date = new Date(
        parseInt(dateString.slice(0, 4)),
        parseInt(dateString.slice(4, 6)) - 1,
        parseInt(dateString.slice(6, 8))
    );

    const user = await getUntisUserData(discordId);
    const untis = new WebUntis(
        user.untisSchoolName,
        user.untisUsername,
        user.untisPassword,
        user.untisUrl
    );

    let timetable = await getTimeTableForDate(untis, date);
    timetable = await mergeLessons(timetable);
    const lesson = timetable.find((lesson) => lesson.id === Number(subjectId));

    if (!lesson) {
        await interaction.update({
            content: `Lesson for subject ${subjectId} not found. ${buttonId}`,
        });
        return;
    }

    const teacher = await getTeacherData(lesson.te[0].id);
    const homework = await getHomeworksForDate(date, untis);
    console.log(homework);
    console.log(lesson);

    let homeworkSubjectID = -1;
    homework.lessons.forEach((subject: any) => {
        if (subject.subject === lesson.su[0].name) {
            homeworkSubjectID = subject.id;
        }
    });

    let homeworkForLesson: Homework[] = [];
    homework.homeworks.forEach((hw: Homework) => {
        if (hw.lessonId === homeworkSubjectID) {
            homeworkForLesson.push(hw);
        }
    });

    // Create a new embed message
    const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`Lesson Details for ${lesson.su[0].longname}`)
        .addFields(
            { name: 'Date', value: date.toDateString() },
            {
                name: 'Time',
                value: `${await formatUntisTime(
                    lesson.startTime.toString()
                )} - ${await formatUntisTime(lesson.endTime.toString())}`,
            },
            {
                name: 'Teacher',
                value: teacher
                    ? `${teacher.foreName} ${teacher.longName}`
                    : 'Teacher not available',
            },
            {
                name: 'Room',
                value: lesson.ro[0].name,
            },
            {
                name: 'Homework',
                value: homeworkForLesson.length
                    ? homeworkForLesson
                          .map((hw: Homework) => hw.text)
                          .join('\n')
                    : 'No homework for this lesson',
            }
        );

    // Filter out existing detail embeds
    const existingEmbeds = interaction.message.embeds.filter(
        (embed) => embed.title && !embed.title.startsWith('Lesson Details for')
    );

    // Handle button click here
    // For example, reply with the name of the subject
    await interaction.update({
        embeds: [...existingEmbeds, embed], // Add the new embed message to the existing ones
    });
}
