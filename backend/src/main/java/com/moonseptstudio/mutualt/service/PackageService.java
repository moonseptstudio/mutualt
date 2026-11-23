package com.moonseptstudio.mutualt.service;

import com.moonseptstudio.mutualt.dto.TrialStatusDto;
import com.moonseptstudio.mutualt.model.SubscriptionPackage;
import com.moonseptstudio.mutualt.model.User;
import com.moonseptstudio.mutualt.repository.PackageRepository;
import com.moonseptstudio.mutualt.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;

@Service
public class PackageService {

    /** Every account gets its first 14 days of Premium free, no card details needed. */
    public static final int TRIAL_DAYS = 14;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PackageRepository packageRepository;

    public boolean canUserPerform3WayTransfer(Long userId) {
        return userRepository.findById(userId)
                .map(User::getSubscriptionPackage)
                .map(SubscriptionPackage::getAllows3way)
                .orElse(false);
    }

    public boolean shouldShowAds(Long userId) {
        return userRepository.findById(userId)
                .map(User::getSubscriptionPackage)
                .map(SubscriptionPackage::getHasAds)
                .orElse(true);
    }

    public void upgradeUserToPremium(Long userId, int durationMonths) {
        User user = userRepository.findById(userId).orElseThrow();
        SubscriptionPackage premium = packageRepository.findByName("PREMIUM").orElseThrow();
        
        user.setSubscriptionPackage(premium);
        
        java.time.LocalDateTime currentEnd = user.getSubscriptionEndDate();
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        
        if (currentEnd != null && currentEnd.isAfter(now)) {
            user.setSubscriptionEndDate(currentEnd.plusMonths(durationMonths));
        } else {
            user.setSubscriptionEndDate(now.plusMonths(durationMonths));
        }
        
        userRepository.save(user);
    }

    // ───────────────────────────── Free trial ─────────────────────────────

    /**
     * Days left, rounded up: a trial claimed seconds ago still reads "14 days", and the
     * final part-day reads "1 day" rather than "0".
     */
    private long daysLeft(LocalDateTime from, LocalDateTime to) {
        if (to == null || !to.isAfter(from)) {
            return 0;
        }
        long seconds = Duration.between(from, to).getSeconds();
        return (seconds + 86399) / 86400;
    }

    /** Raised when the free trial cannot be claimed. The code lets clients translate it. */
    public static class TrialNotAvailableException extends IllegalStateException {
        private final String code;

        public TrialNotAvailableException(String code, String message) {
            super(message);
            this.code = code;
        }

        public String getCode() {
            return code;
        }
    }

    public TrialStatusDto getTrialStatus(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        LocalDateTime now = LocalDateTime.now();

        // Self-heal: If an active trial was set to (createdAt + 14 days) by the old legacy logic,
        // restore the user's full 14 days from now so they don't lose days simply because their account is older.
        if (user.isTrialUsed() && user.getTrialEndDate() != null && user.getTrialEndDate().isAfter(now)) {
            if (user.getCreatedAt() != null && user.getTrialEndDate().isBefore(now.plusDays(TRIAL_DAYS - 1))) {
                long diffSeconds = Math.abs(Duration.between(user.getTrialEndDate(), user.getCreatedAt().plusDays(TRIAL_DAYS)).getSeconds());
                if (diffSeconds < 3600) {
                    LocalDateTime restoredEnd = now.plusDays(TRIAL_DAYS);
                    user.setTrialEndDate(restoredEnd);
                    if (user.getSubscriptionEndDate() == null || user.getSubscriptionEndDate().isBefore(restoredEnd)) {
                        user.setSubscriptionEndDate(restoredEnd);
                    }
                    userRepository.save(user);
                }
            }
        }

        return buildTrialStatus(user);
    }

    private TrialStatusDto buildTrialStatus(User user) {
        LocalDateTime now = LocalDateTime.now();

        boolean claimed = user.isTrialUsed();
        boolean eligible = !claimed;
        boolean active = claimed
                && user.getTrialEndDate() != null
                && now.isBefore(user.getTrialEndDate());
        boolean expired = claimed && !active;

        TrialStatusDto dto = new TrialStatusDto();
        dto.setTrialDays(TRIAL_DAYS);
        dto.setEligible(eligible);
        dto.setClaimed(claimed);
        dto.setActive(active);
        dto.setExpired(expired);
        dto.setDaysLeftToClaim(eligible ? TRIAL_DAYS : 0);
        dto.setDaysRemaining(active ? daysLeft(now, user.getTrialEndDate()) : 0);
        dto.setWindowEndDate(active ? user.getTrialEndDate() : now.plusDays(TRIAL_DAYS));
        dto.setTrialEndDate(user.getTrialEndDate());
        return dto;
    }

    /**
     * Grants the one-off free trial for 14 days starting from the claim time.
     * No payment and no card details are involved.
     *
     * @throws TrialNotAvailableException when the trial was already claimed.
     */
    @jakarta.transaction.Transactional
    public TrialStatusDto claimFreeTrial(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        LocalDateTime now = LocalDateTime.now();

        if (user.isTrialUsed()) {
            throw new TrialNotAvailableException(
                    "TRIAL_ALREADY_CLAIMED", "Free trial already claimed for this account.");
        }

        SubscriptionPackage premium = packageRepository.findByName("PREMIUM").orElseThrow();

        LocalDateTime trialEnd = now.plusDays(TRIAL_DAYS);

        user.setTrialUsed(true);
        user.setTrialEndDate(trialEnd);
        user.setSubscriptionPackage(premium);

        // Never shorten an existing paid subscription that already runs past the trial.
        LocalDateTime currentEnd = user.getSubscriptionEndDate();
        if (currentEnd == null || currentEnd.isBefore(trialEnd)) {
            user.setSubscriptionEndDate(trialEnd);
        }

        userRepository.save(user);
        return buildTrialStatus(user);
    }

    @jakarta.transaction.Transactional
    public void processExpiredSubscriptions() {
        SubscriptionPackage free = packageRepository.findByName("FREE").orElseThrow();
        userRepository.findBySubscriptionPackageNameAndSubscriptionEndDateBefore("PREMIUM", java.time.LocalDateTime.now())
                .forEach(user -> {
                    user.setSubscriptionPackage(free);
                    user.setSubscriptionEndDate(null);
                    userRepository.save(user);
                });
    }
}
