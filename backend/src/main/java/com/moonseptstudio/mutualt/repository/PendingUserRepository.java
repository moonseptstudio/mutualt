package com.moonseptstudio.mutualt.repository;

import com.moonseptstudio.mutualt.model.PendingUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PendingUserRepository extends JpaRepository<PendingUser, Long> {
    Optional<PendingUser> findByPhoneNumber(String phoneNumber);
    Optional<PendingUser> findByUsername(String username);
    boolean existsByUsername(String username);
}
