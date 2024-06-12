import { execSync } from 'child_process'; // Use execSync for synchronous execution
import fs from 'fs';
import os from 'os';
import path from 'path';

export async function sendWakeOnLanPacket(
    macAddress: string,
    sshHost: string,
    sshPort: number,
    sshUser: string,
    sshKey: string,
    useTempFile = false // Optional flag to use temporary file for SSH key
) {
    // Remove all spaces from the sshKey
    sshKey = sshKey.replace(/\s/g, '');

    // Convert MAC address to the correct format
    const formattedMacAddress = macAddress.replace(/-/g, ':');

    // Construct the SSH command based on whether a temporary file is used
    let sshCommand = '';

    if (useTempFile) {
        // Create a temporary file to store the SSH key
        const keyFilePath = path.join(os.tmpdir(), 'temp_ssh_key');

        try {
            // Write the SSH key to the temporary file with secure permissions
            fs.writeFileSync(keyFilePath, sshKey, { mode: 0o600 });
            console.log('SSH key written to:', keyFilePath);

            // Construct the SSH command
            sshCommand = `
                ssh -vvv -o StrictHostKeyChecking=no -i ${keyFilePath} -p ${sshPort} ${sshUser}@${sshHost} "
                if ! command -v wakeonlan &> /dev/null; then
                    echo 'wakeonlan not found, attempting to install...';
                    sudo apt-get update && sudo apt-get install -y wakeonlan;
                fi;
                wakeonlan ${formattedMacAddress}"`;

            console.log(
                'Executing SSH command with temporary file:',
                sshCommand
            );

            // Execute the SSH command synchronously
            const output = execSync(sshCommand, { stdio: 'pipe' }).toString();
            console.log('SSH command output:', output);
        } catch (error: unknown) {
            if (
                typeof error === 'object' &&
                error !== null &&
                'message' in error
            ) {
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
    } else {
        // Use inline SSH key (here it assumes the remote system's shell supports process substitution)
        sshCommand = `
            ssh -vvv -o StrictHostKeyChecking=no -p ${sshPort} ${sshUser}@${sshHost} "
            echo '${sshKey}' | ssh -i /dev/stdin ${sshUser}@${sshHost} bash -c \"
            if ! command -v wakeonlan &> /dev/null; then
                echo 'wakeonlan not found, attempting to install...';
                sudo apt-get update && sudo apt-get install -y wakeonlan;
            fi;
            wakeonlan ${formattedMacAddress}\""`;

        console.log('Executing SSH command with inline key:');

        try {
            // Execute the SSH command synchronously
            const output = execSync(sshCommand, { stdio: 'pipe' }).toString();
            console.log('SSH command output:', output);
        } catch (error: unknown) {
            if (
                typeof error === 'object' &&
                error !== null &&
                'message' in error
            ) {
                console.error('Error during SSH execution:', error.message);
            }
            throw error;
        }
    }
}
