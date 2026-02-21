/**
 * Generates a unique student username in the format: FX + 3 random lowercase + 4 random digits
 * Example: FXlpa6534
 */
export const generateUsername = (): string => {
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    const digits = '0123456789';

    let randomLetters = '';
    for (let i = 0; i < 3; i++) {
        randomLetters += letters.charAt(Math.floor(Math.random() * letters.length));
    }

    let randomDigits = '';
    for (let i = 0; i < 4; i++) {
        randomDigits += digits.charAt(Math.floor(Math.random() * digits.length));
    }

    return `FX${randomLetters}${randomDigits}`;
};
