/**
 * Validates Sri Lankan NIC (National Identity Card) numbers.
 * Supports:
 * 1. Old format: 9 digits followed by 'V' or 'v' (e.g., 123456789V)
 * 2. New format: 12 digits (e.g., 123456789012)
 */
export const isValidNic = (nic: string): boolean => {
    if (!nic) return false;
    
    // Old format: 9 digits + V/v
    const oldNicRegex = /^[0-9]{9}[vV]$/;
    // New format: 12 digits
    const newNicRegex = /^[0-9]{12}$/;
    
    return oldNicRegex.test(nic) || newNicRegex.test(nic);
};
