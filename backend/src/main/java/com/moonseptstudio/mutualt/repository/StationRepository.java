package com.moonseptstudio.mutualt.repository;

import com.moonseptstudio.mutualt.model.Station;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StationRepository extends JpaRepository<Station, Long> {
    List<Station> findByDistrict(String district);

    List<Station> findByNameContainingIgnoreCase(String name);
}
