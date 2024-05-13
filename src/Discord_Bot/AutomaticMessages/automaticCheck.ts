import { updateDB } from '../../WebUntisAPI/DBUpdater.js';
import { preNotify } from './Checks/PreNotify.js';

// This function will be called every 5 minutes
export async function automaticCheck() {
    let nextCheck = 2 * 60 * 1000; // 2 minutes

    updateDB();

    preNotify(); // Notify users about upcoming lessons

    setTimeout(automaticCheck, nextCheck);
}
