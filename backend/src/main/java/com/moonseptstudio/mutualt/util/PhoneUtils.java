package com.moonseptstudio.mutualt.util;

import java.util.regex.Pattern;

public class PhoneUtils {
    private static final Pattern SRI_LANKA_MOBILE_PATTERN = Pattern.compile("^947\\d{8}$");

    /**
     * Normalizes a phone number to the 947XXXXXXXX format.
     * 
     * @param phone The input phone number string.
     * @return The normalized phone number or null if invalid.
     */
    public static String normalize(String phone) {
        if (phone == null) return null;

        // Remove all non-digit characters
        String digits = phone.replaceAll("\\D", "");

        // Handle common Sri Lankan formats
        if (digits.startsWith("07") && digits.length() == 10) {
            // e.g., 0771234567 -> 94771234567
            digits = "94" + digits.substring(1);
        } else if (digits.startsWith("7") && digits.length() == 9) {
            // e.g., 771234567 -> 94771234567 (user entered 9-digit suffix)
            digits = "94" + digits;
        }

        // Final validation
        if (isValid(digits)) {
            return digits;
        }

        return null;
    }

    /**
     * Checks if the phone number matches the 947XXXXXXXX format.
     */
    public static boolean isValid(String phone) {
        return phone != null && SRI_LANKA_MOBILE_PATTERN.matcher(phone).matches();
    }
}
