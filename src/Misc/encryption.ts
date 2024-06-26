import * as crypto from 'crypto';

const algorithm = 'aes-256-cbc';
let secretKey = process.env.ENCRYPTION_KEY; // Replace with a 32-byte key

if (!secretKey) {
    throw new Error('Missing ENCRYPTION_KEY environment variable');
}

// Ensure the key is exactly 32 bytes long
if (secretKey.length > 32) {
    secretKey = secretKey.substring(0, 32);
} else if (secretKey.length < 32) {
    secretKey = secretKey.padEnd(32, '.');
}

const iv = crypto.randomBytes(16);

export const encrypt = (text: string): string => {
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
};

export const decrypt = (text: string): string => {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(
        algorithm,
        Buffer.from(secretKey),
        iv
    );
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
};
