package com.moonseptstudio.mutualt.repository;

import com.moonseptstudio.mutualt.model.UserSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserSettingsRepository extends JpaRepository<UserSettings, Long> {
    Optional<UserSettings> findByUserId(Long userId);
    void deleteByUserId(Long userId);
}
