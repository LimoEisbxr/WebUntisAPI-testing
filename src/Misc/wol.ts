import { Client } from 'ssh2';

export async function sendWakeOnLanPacket(
    macAddress: string,
    sshHost: string,
    sshPort: number,
    sshUser: string,
    sshKey: string
): Promise<void> {
    const conn = new Client();

    return new Promise((resolve, reject) => {
        conn.on('ready', () => {
            console.log('Client :: ready');
            const wakeCommand = `wakeonlan ${macAddress}`;
            conn.exec(wakeCommand, (err, stream) => {
                if (err) {
                    conn.end();
                    return reject(err);
                }
                stream
                    .on('close', (code: number, signal: string) => {
                        console.log(
                            'Stream :: close :: code: ' +
                                code +
                                ', signal: ' +
                                signal
                        );
                        conn.end();
                        if (code !== 0) {
                            return reject(
                                new Error(`Non-zero exit code: ${code}`)
                            );
                        }
                        resolve();
                    })
                    .on('data', (data: Buffer) => {
                        console.log('STDOUT: ' + data.toString());
                    })
                    .stderr.on('data', (data: Buffer) => {
                        console.error('STDERR: ' + data.toString());
                        reject(
                            new Error(
                                `Error executing wakeonlan command: ${data.toString()}`
                            )
                        );
                    });
            });
        }).connect({
            host: sshHost,
            port: sshPort,
            username: sshUser,
            privateKey: sshKey.trim(), // Trimming any accidental whitespace
        });
    });
}
