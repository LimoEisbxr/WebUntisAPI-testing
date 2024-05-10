import { time } from 'console';

// This function will be called every 5 minutes
export async function automaticCheck() {
    let nextCheck = 2 * 60 * 1000; // 2 minutes

    setTimeout(automaticCheck, nextCheck);
}
