package com.moonseptstudio.mutualt.util;

import java.util.regex.Pattern;

public class NicUtils {
    // Old format: 9 digits followed by 'V' or 'v'
    private static final Pattern OLD_NIC_PATTERN = Pattern.compile("^[0-9]{9}[vV]$");
    // New format: 12 digits
    private static final Pattern NEW_NIC_PATTERN = Pattern.compile("^[0-9]{12}$");

    /**
     * Validates Sri Lankan NIC (National Identity Card) numbers.
     * Supports:
     * 1. Old format: 9 digits followed by 'V' or 'v' (e.g., 123456789V)
     * 2. New format: 12 digits (e.g., 123456789012)
     * 
     * @param nic The NIC string to validate.
     * @return true if the NIC is valid, false otherwise.
     */
    public static boolean isValid(String nic) {
        if (nic == null || nic.isEmpty()) {
            return false;
        }
        return OLD_NIC_PATTERN.matcher(nic).matches() || NEW_NIC_PATTERN.matcher(nic).matches();
    }
}
