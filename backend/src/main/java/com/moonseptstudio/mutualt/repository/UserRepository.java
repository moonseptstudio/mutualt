package com.moonseptstudio.mutualt.repository;

import com.moonseptstudio.mutualt.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);

    Boolean existsByUsername(String username);

    long countByVerifiedFalse();

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(u) FROM User u WHERE u.subscriptionPackage.name = :name")
    long countBySubscriptionPackageName(String name);

    java.util.List<User> findBySubscriptionPackageNameAndSubscriptionEndDateBefore(String packageName, java.time.LocalDateTime now);
}
