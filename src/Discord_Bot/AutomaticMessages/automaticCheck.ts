import { time } from 'console';
import { updateDB } from '../../WebUntisAPI/DBUpdater.js';

// This function will be called every 5 minutes
export async function automaticCheck() {
    let nextCheck = 2 * 60 * 1000; // 2 minutes

    updateDB();

    setTimeout(automaticCheck, nextCheck);
}
