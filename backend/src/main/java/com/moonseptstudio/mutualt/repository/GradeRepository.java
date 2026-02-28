package com.moonseptstudio.mutualt.repository;

import com.moonseptstudio.mutualt.model.Grade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GradeRepository extends JpaRepository<Grade, Long> {
}
