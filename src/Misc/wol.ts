import { execSync } from 'child_process'; // Use execSync for synchronous execution
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
        // Write the SSH key to the temporary file with secure permissions
        fs.writeFileSync(keyFilePath, sshKey, { mode: 0o600 });
        console.log('SSH key written to:', keyFilePath);

        // Verify the file was created successfully and read the content for debugging
        if (!fs.existsSync(keyFilePath)) {
            throw new Error(
                'Temporary SSH key file does not exist after writing.'
            );
        }
        const keyFileContent = fs.readFileSync(keyFilePath, 'utf8');
        console.log('SSH key file content:', keyFileContent);

        // Construct the SSH command with verbose logging
        const sshCommand = `
            ssh -vvv -o StrictHostKeyChecking=no -i ${keyFilePath} -p ${sshPort} ${sshUser}@${sshHost} "
            if ! command -v wakeonlan &> /dev/null; then
                echo 'wakeonlan not found, attempting to install...';
                sudo apt-get update && sudo apt-get install -y wakeonlan;
            fi;
            wakeonlan ${formattedMacAddress}"`;

        console.log('Executing SSH command:', sshCommand);

        // Execute the SSH command synchronously
        const output = execSync(sshCommand, { stdio: 'pipe' }).toString();
        console.log('SSH command output:', output);
    } catch (error: unknown) {
        if (typeof error === 'object' && error !== null && 'message' in error) {
            console.error('Error during SSH execution:', error.message);
        }
        throw error;
    } finally {
        // Clean up the temporary key file
        if (fs.existsSync(keyFilePath)) {
            try {
                fs.unlinkSync(keyFilePath);
                console.log('Temporary SSH key file deleted:', keyFilePath);
            } catch (unlinkError) {
                console.error(
                    'Error deleting temporary SSH key file:',
                    unlinkError
                );
            }
        }
    }
}
