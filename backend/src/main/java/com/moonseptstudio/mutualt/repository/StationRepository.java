package com.moonseptstudio.mutualt.repository;

import com.moonseptstudio.mutualt.model.Station;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

@Repository
public interface StationRepository extends JpaRepository<Station, Long> {
    List<Station> findByDistrict(String district);

    List<Station> findByNameContainingIgnoreCase(String name);

    @Query("SELECT DISTINCT s.district FROM Station s ORDER BY s.district")
    List<String> findDistinctDistricts();

    List<Station> findByDistrictAndField_Id(String district, Long fieldId);

    List<Station> findByField_Id(Long fieldId);
}

