package com.moonseptstudio.mutualt.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class SubscriptionCleanupService {

    @Autowired
    private PackageService packageService;

    // Runs every hour
    @Scheduled(fixedRate = 3600000)
    public void cleanupExpiredSubscriptions() {
        packageService.processExpiredSubscriptions();
    }
}
