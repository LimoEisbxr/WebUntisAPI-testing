import { NodeSSH } from 'node-ssh';
import wol from 'wake_on_lan';

export async function sendWakeOnLanPacket(macAddress: string, sshHost: string, sshPort: number, sshUser: string, sshKey: string) {
    const ssh = new NodeSSH();

    try {
        // Connect to the SSH server
        await ssh.connect({
            host: sshHost,
            port: sshPort,
            username: sshUser,
            privateKey: sshKey
        });

        // Execute the wakeonlan command
        const wakeCommand = `wakeonlan ${macAddress}`;
        const result = await ssh.execCommand(wakeCommand);

        if (result.stderr) {
            throw new Error(`Error executing wakeonlan command: ${result.stderr}`);
        }

        // If the command was successful, send a WOL packet as well
        return new Promise<void>((resolve, reject) => {
            wol.wake(macAddress, (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    } catch (error) {
        throw error;
    } finally {
        ssh.dispose();
    }
}