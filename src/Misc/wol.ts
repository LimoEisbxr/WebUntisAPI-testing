import { Client } from 'ssh2';

export async function sendWakeOnLanPacket(
    macAddress: string,
    sshHost: string,
    sshPort: number,
    sshUser: string,
    sshKey: string
) {
    const conn = new Client();

    try {
        // Connect to the SSH server
        await conn.connect({
            host: sshHost,
            port: sshPort,
            username: sshUser,
            privateKey: sshKey,
        });

        // Execute the wakeonlan command
        const wakeCommand = `wakeonlan ${macAddress}`;
        conn.exec(wakeCommand, (err, stream) => {
            if (err) throw err;
            stream
                .on('close', (code: number, signal: string) => {
                    console.log(
                        'Stream :: close :: code: ' +
                            code +
                            ', signal: ' +
                            signal
                    );
                    conn.end();
                })
                .on('data', (data: any) => {
                    console.log('STDOUT: ' + data);
                })
                .stderr.on('data', (data: any) => {
                    console.error('STDERR: ' + data);
                });
        });
    } catch (error) {
        throw error;
    }
}
