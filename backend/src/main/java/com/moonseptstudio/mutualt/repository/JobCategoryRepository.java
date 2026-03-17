package com.moonseptstudio.mutualt.repository;

import com.moonseptstudio.mutualt.model.JobCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobCategoryRepository extends JpaRepository<JobCategory, Long> {
    List<JobCategory> findByField_Id(Long fieldId);
}
