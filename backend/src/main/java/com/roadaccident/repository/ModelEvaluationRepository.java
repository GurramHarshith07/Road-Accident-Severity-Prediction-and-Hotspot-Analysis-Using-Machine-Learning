package com.roadaccident.repository;

import com.roadaccident.entity.ModelEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ModelEvaluationRepository extends JpaRepository<ModelEvaluation, Long> {
    List<ModelEvaluation> findAllByOrderByAccuracyDesc();
    Optional<ModelEvaluation> findTopByModelNameOrderByEvaluatedAtDesc(String modelName);
}
