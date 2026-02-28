package com.moonseptstudio.mutualt.repository;

import com.moonseptstudio.mutualt.model.TransferPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TransferPreferenceRepository extends JpaRepository<TransferPreference, Long> {
    List<TransferPreference> findByUserIdOrderByPriorityAsc(Long userId);
}
