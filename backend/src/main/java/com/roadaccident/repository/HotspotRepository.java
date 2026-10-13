package com.roadaccident.repository;

import com.roadaccident.entity.Hotspot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HotspotRepository extends JpaRepository<Hotspot, Long> {
    List<Hotspot> findAllByOrderByAccidentCountDesc();
    List<Hotspot> findByRiskCategory(String riskCategory);
}
