export function generateRandomString(length = 16) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export const ownMetadata = generateRandomString(16);

export function uint8ArrayToHex(uint8Array: Uint8Array): string {
    return Array.from(uint8Array)
        .map(byte => byte.toString(16).padStart(2, '0')) // Convert each byte to a 2-digit hex string
        .join(''); // Combine into a single string
}

export function hexToUint8Array(hex: string): Uint8Array {
    // Step 1: Handle 0x prefix
    if (hex.startsWith("0x")) {
        hex = hex.slice(2);
    }

    // Step 2: Ensure the hex string has an even length
    if (hex.length % 2 !== 0) {
        throw new Error("Hex string must have an even length");
    }

    // Step 3: Convert hex string to Uint8Array
    const uint8Array = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        uint8Array[i / 2] = parseInt(hex.substr(i, 2), 16);
    }

    return uint8Array;
}
