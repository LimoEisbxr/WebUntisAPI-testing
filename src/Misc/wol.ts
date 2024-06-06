import wol from 'wake_on_lan';

export function sendWakeOnLanPacket(macAddress: string) {
    return new Promise<void>((resolve, reject) => {
        wol.wake(macAddress, (error) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}
