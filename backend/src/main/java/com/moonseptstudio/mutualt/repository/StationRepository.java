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

    @Query("SELECT DISTINCT s.district FROM Station s WHERE s.status = 'APPROVED' OR s.status IS NULL ORDER BY s.district")
    List<String> findDistinctDistricts();

    List<Station> findByDistrictAndField_Id(String district, Long fieldId);

    List<Station> findByField_Id(Long fieldId);

    List<Station> findByStatus(String status);

    List<Station> findByDistrictAndStatus(String district, String status);

    List<Station> findByDistrictAndField_IdAndStatus(String district, Long fieldId, String status);

    List<Station> findByField_IdAndStatus(Long fieldId, String status);

    List<Station> findByNameContainingIgnoreCaseAndStatus(String name, String status);

    long countByStatus(String status);
}

