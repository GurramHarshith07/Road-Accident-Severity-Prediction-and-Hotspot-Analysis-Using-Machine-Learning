package com.roadaccident.repository;

import com.roadaccident.entity.PredictionRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PredictionRecordRepository extends JpaRepository<PredictionRecord, Long> {
    Optional<PredictionRecord> findByRequestId(String requestId);
    Page<PredictionRecord> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
