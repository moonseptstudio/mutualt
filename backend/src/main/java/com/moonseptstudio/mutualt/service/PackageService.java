package com.moonseptstudio.mutualt.service;

import com.moonseptstudio.mutualt.model.SubscriptionPackage;
import com.moonseptstudio.mutualt.model.User;
import com.moonseptstudio.mutualt.repository.PackageRepository;
import com.moonseptstudio.mutualt.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PackageService {

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
