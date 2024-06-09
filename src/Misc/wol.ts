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
    // Convert MAC address to the correct format
    const formattedMacAddress = macAddress.replace(/-/g, ':');

    // Create a temporary file to store the SSH key
    const keyFilePath = path.join(os.tmpdir(), 'temp_ssh_key');

    try {
        fs.writeFileSync(keyFilePath, sshKey, { mode: 0o600 });

        // Construct the SSH command to check for wakeonlan and install if not found
        const sshCommand = `
            ssh -o StrictHostKeyChecking=no -i ${keyFilePath} -p ${sshPort} ${sshUser}@${sshHost} "
            if ! command -v wakeonlan &> /dev/null; then
                echo 'wakeonlan not found, attempting to install...';
                sudo apt-get update && sudo apt-get install -y wakeonlan;
            fi;
            wakeonlan ${formattedMacAddress}"`;

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
    } catch (writeError) {
        console.error('Error writing SSH key to file:', writeError);
        throw writeError;
    } finally {
        // Clean up the temporary key file
        if (fs.existsSync(keyFilePath)) {
            fs.unlinkSync(keyFilePath);
        }
    }
}
