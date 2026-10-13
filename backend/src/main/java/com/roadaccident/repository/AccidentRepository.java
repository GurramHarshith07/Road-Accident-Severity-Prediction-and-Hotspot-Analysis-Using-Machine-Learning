package com.roadaccident.repository;

import com.roadaccident.entity.Accident;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AccidentRepository extends JpaRepository<Accident, Long>, JpaSpecificationExecutor<Accident> {

    long countBySeverity(String severity);

    long countByAccidentDateBetween(LocalDate startDate, LocalDate endDate);

    Page<Accident> findByCityContainingIgnoreCase(String city, Pageable pageable);

    Page<Accident> findBySeverity(String severity, Pageable pageable);

    Page<Accident> findByAccidentDateBetween(LocalDate startDate, LocalDate endDate, Pageable pageable);

    @Query("SELECT DISTINCT a.city FROM Accident a WHERE a.city IS NOT NULL ORDER BY a.city")
    List<String> findDistinctCities();

    @Query("SELECT a.severity, COUNT(a) FROM Accident a GROUP BY a.severity")
    List<Object[]> countAccidentsBySeverity();

    @Query("SELECT FUNCTION('MONTH', a.accidentDate) as m, FUNCTION('YEAR', a.accidentDate) as y, a.severity, COUNT(a) " +
           "FROM Accident a GROUP BY FUNCTION('YEAR', a.accidentDate), FUNCTION('MONTH', a.accidentDate), a.severity " +
           "ORDER BY y ASC, m ASC")
    List<Object[]> findMonthlyTrendsBySeverity();

    @Query("SELECT a.weatherCondition, a.severity, COUNT(a) FROM Accident a GROUP BY a.weatherCondition, a.severity")
    List<Object[]> findWeatherAnalysis();

    @Query("SELECT a.roadType, a.severity, COUNT(a) FROM Accident a GROUP BY a.roadType, a.severity")
    List<Object[]> findRoadTypeAnalysis();

    @Query("SELECT FUNCTION('HOUR', a.accidentTime) as h, COUNT(a) FROM Accident a GROUP BY FUNCTION('HOUR', a.accidentTime) ORDER BY h ASC")
    List<Object[]> findHourlyDistribution();

    @Query("SELECT a.lightingCondition, COUNT(a) FROM Accident a GROUP BY a.lightingCondition")
    List<Object[]> findLightingDistribution();

    @Query("SELECT a.roadSurfaceCondition, COUNT(a) FROM Accident a GROUP BY a.roadSurfaceCondition")
    List<Object[]> findRoadSurfaceDistribution();

    @Query("SELECT a.areaType, a.severity, COUNT(a) FROM Accident a GROUP BY a.areaType, a.severity")
    List<Object[]> findAreaTypeDistribution();

    @Query("SELECT a.city, COUNT(a), SUM(CASE WHEN a.severity = 'Fatal' THEN 1 ELSE 0 END), SUM(CASE WHEN a.severity = 'Serious' THEN 1 ELSE 0 END) " +
           "FROM Accident a GROUP BY a.city ORDER BY COUNT(a) DESC")
    List<Object[]> findCityWiseStatistics();

    @Query("SELECT a FROM Accident a WHERE a.latitude IS NOT NULL AND a.longitude IS NOT NULL")
    List<Accident> findAllWithCoordinates();

    @Query("SELECT a FROM Accident a WHERE a.accidentDate BETWEEN :startDate AND :endDate AND a.latitude IS NOT NULL AND a.longitude IS NOT NULL")
    List<Accident> findByDateRangeWithCoordinates(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
