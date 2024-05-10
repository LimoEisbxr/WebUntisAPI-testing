import { WebUntis } from "webuntis";
import { getRandomPrimaryUser } from "../Database/databaseFunctions.js";
import { getAllTeachers } from "./APIFunctions.js";

export async function updateDB() {
    const primaryUser = await getRandomPrimaryUser();

    if (primaryUser === false) {
        console.log("No primary user found!");
        return;
    }

    const untis = new WebUntis(
        primaryUser.UntisUser.untisSchoolName,
        primaryUser.UntisUser.untisUsername,
        primaryUser.UntisUser.untisPassword,
        primaryUser.UntisUser.untisUrl
    );

    const allTeachers = await getAllTeachers(untis);

    console.log("Updating DB... allTeachers:", allTeachers);
    console.log("DB updated!");
}
