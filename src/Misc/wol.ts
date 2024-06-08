import { NodeSSH } from 'node-ssh';

export async function sendWakeOnLanPacket(
    macAddress: string,
    sshHost: string,
    sshPort: number,
    sshUser: string,
    sshKey: string
) {
    const ssh = new NodeSSH();

    try {
        // Connect to the SSH server
        await ssh.connect({
            host: sshHost,
            port: sshPort,
            username: sshUser,
            privateKey: sshKey,
        });

        // Execute the wakeonlan command
        const wakeCommand = `wakeonlan ${macAddress}`;
        const result = await ssh.execCommand(wakeCommand);

        if (result.stderr) {
            throw new Error(
                `Error executing wakeonlan command: ${result.stderr}`
            );
        }
    } catch (error) {
        console.error(
            'Error connecting to SSH server or executing command:',
            error
        );
        throw error;
    } finally {
        ssh.dispose();
    }
}
