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

    public void upgradeUserToPremium(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        SubscriptionPackage premium = packageRepository.findByName("PREMIUM").orElseThrow();
        user.setSubscriptionPackage(premium);
        userRepository.save(user);
    }
}
