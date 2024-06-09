import { exec } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

export async function sendWakeOnLanPacket(
    macAddress: string,
    sshHost: string,
    sshPort: number,
    sshUser: string,
    sshKey: string
) {
    // Create a temporary file to store the SSH key
    const keyFilePath = path.join(os.tmpdir(), 'temp_ssh_key');
    fs.writeFileSync(keyFilePath, sshKey, { mode: 0o600 });

    try {
        // Construct the SSH command
        const sshCommand = `ssh -i ${keyFilePath} -p ${sshPort} ${sshUser}@${sshHost} wakeonlan ${macAddress}`;

        // Execute the SSH command
        exec(sshCommand, (error, stdout, stderr) => {
            if (error) {
                console.error('Error executing SSH command:', error);
                throw error;
            }

            if (stderr) {
                console.error('Error from SSH command:', stderr);
            }

            console.log('SSH command output:', stdout);
        });
    } finally {
        // Clean up the temporary key file
        fs.unlinkSync(keyFilePath);
    }
}
