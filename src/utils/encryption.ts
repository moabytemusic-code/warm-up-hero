import crypto from 'crypto';

// In production, this must be stored in an environment variable
// The key length is dependent on the algorithm. In this case for aes256, it is 32 bytes.
const ENCRYPTION_KEY_ENV = process.env.ENCRYPTION_KEY || '12345678901234567890123456789012';

// Ensure the key is a Buffer of correct length (32 bytes for aes-256-cbc)
// If the env var provides a hex string (common practice), we buffer it.
const ENCRYPTION_KEY = Buffer.byteLength(ENCRYPTION_KEY_ENV, 'hex') === 32
    ? Buffer.from(ENCRYPTION_KEY_ENV, 'hex')
    : ENCRYPTION_KEY_ENV;

const IV_LENGTH = 16; // For AES, this is always 16

/**
 * Encrypts a string using AES-256-CBC
 * @param text The text to encrypt
 * @returns Object containing the IV and the encrypted data as hex strings
 */
export function encrypt(text: string): { iv: string; encryptedData: string } {
    if (!text) return { iv: '', encryptedData: '' };

    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return {
        iv: iv.toString('hex'),
        encryptedData: encrypted.toString('hex')
    };
}

/**
 * Decrypts data using AES-256-CBC
 * @param encryptedData The encrypted data as a hex string
 * @param ivHex The IV used for encryption as a hex string
 * @returns The decrypted string
 */
export function decrypt(encryptedData: string, ivHex: string): string {
    if (!encryptedData || !ivHex) return '';

    const iv = Buffer.from(ivHex, 'hex');
    const encryptedText = Buffer.from(encryptedData, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
}
