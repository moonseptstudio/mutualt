package com.moonseptstudio.mutualt.repository;

import com.moonseptstudio.mutualt.model.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
    Optional<UserProfile> findByUserId(Long userId);

    List<UserProfile> findByJobCategoryIdAndGradeId(Long jobCategoryId, Long gradeId);

    List<UserProfile> findByUserIdIn(List<Long> userIds);

    Optional<UserProfile> findByPhoneNumber(String phoneNumber);

    boolean existsByNic(String nic);
}
