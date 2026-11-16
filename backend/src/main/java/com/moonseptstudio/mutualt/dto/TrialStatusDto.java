package com.moonseptstudio.mutualt.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Snapshot of a user's free-trial state.
 *
 * The trial window is fixed to the first {@code trialDays} days after the account was
 * created. Claiming is free and needs no card details, and the trial always ends at
 * {@code windowEndDate} - claiming late gives the remainder of the window, not a fresh
 * 14 days.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TrialStatusDto {

    /** Length of the trial window, in days. */
    private int trialDays;

    /** True when the trial can be claimed right now (never claimed + still inside the window). */
    private boolean eligible;

    /** True once the trial has been claimed, whether or not it is still running. */
    private boolean claimed;

    /** True while a claimed trial is still running. */
    private boolean active;

    /** True when the window has closed without the trial ever being claimed. */
    private boolean expired;

    /** Whole days left before the window closes. 0 once it has closed. */
    private long daysLeftToClaim;

    /** Whole days left on a running trial. 0 when no trial is running. */
    private long daysRemaining;

    /** End of the claim window (createdAt + trialDays). */
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime windowEndDate;

    /** End of the claimed trial. Null until claimed. */
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime trialEndDate;
}
