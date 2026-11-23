package com.moonseptstudio.mutualt.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Snapshot of a user's free-trial state.
 *
 * Every account can claim a 14-day free trial once without card details.
 * When claimed, the trial runs for {@code trialDays} days from the claim date.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TrialStatusDto {

    /** Length of the trial window, in days. */
    private int trialDays;

    /** True when the trial can be claimed right now (never claimed). */
    private boolean eligible;

    /** True once the trial has been claimed, whether or not it is still running. */
    private boolean claimed;

    /** True while a claimed trial is still running. */
    private boolean active;

    /** True when the trial was claimed and has since expired. */
    private boolean expired;

    /** Whole days available to claim (14 while eligible, 0 once claimed). */
    private long daysLeftToClaim;

    /** Whole days left on a running trial. 0 when no trial is running. */
    private long daysRemaining;

    /** End of the trial window or current trial end date. */
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime windowEndDate;

    /** End of the claimed trial. Null until claimed. */
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime trialEndDate;
}
