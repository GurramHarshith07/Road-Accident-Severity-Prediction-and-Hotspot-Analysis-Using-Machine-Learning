package com.roadaccident.service;

import com.roadaccident.dto.AccidentDto;
import com.roadaccident.entity.Accident;
import com.roadaccident.exception.ResourceNotFoundException;
import com.roadaccident.repository.AccidentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class AccidentService {

    private final AccidentRepository accidentRepository;

    public AccidentService(AccidentRepository accidentRepository) {
        this.accidentRepository = accidentRepository;
    }

    public Page<Accident> getAccidents(String city, String severity, LocalDate startDate, LocalDate endDate,
                                      int page, int size, String sortBy, String sortDirection) {
        Sort sort = sortDirection.equalsIgnoreCase("desc") ?
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Specification<Accident> spec = (root, query, cb) -> cb.conjunction();

        if (city != null && !city.trim().isEmpty()) {
            spec = spec.and((root, query, cb) ->
                    cb.like(cb.lower(root.get("city")), "%" + city.toLowerCase().trim() + "%"));
        }

        if (severity != null && !severity.trim().isEmpty() && !severity.equalsIgnoreCase("ALL")) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("severity"), severity.trim()));
        }

        if (startDate != null) {
            spec = spec.and((root, query, cb) ->
                    cb.greaterThanOrEqualTo(root.get("accidentDate"), startDate));
        }

        if (endDate != null) {
            spec = spec.and((root, query, cb) ->
                    cb.lessThanOrEqualTo(root.get("accidentDate"), endDate));
        }

        return accidentRepository.findAll(spec, pageable);
    }

    public Accident getAccidentById(Long id) {
        return accidentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Accident record not found with ID: " + id));
    }

    public Accident createAccident(AccidentDto dto) {
        Accident accident = new Accident();
        copyDtoToEntity(dto, accident);
        return accidentRepository.save(accident);
    }

    public Accident updateAccident(Long id, AccidentDto dto) {
        Accident existing = getAccidentById(id);
        copyDtoToEntity(dto, existing);
        return accidentRepository.save(existing);
    }

    public void deleteAccident(Long id) {
        Accident existing = getAccidentById(id);
        accidentRepository.delete(existing);
    }

    public List<String> getAllCities() {
        return accidentRepository.findDistinctCities();
    }

    public List<Accident> getAllAccidentsWithCoordinates() {
        return accidentRepository.findAllWithCoordinates();
    }

    private void copyDtoToEntity(AccidentDto dto, Accident entity) {
        entity.setAccidentDate(dto.getAccidentDate());
        entity.setAccidentTime(dto.getAccidentTime());
        entity.setLatitude(dto.getLatitude());
        entity.setLongitude(dto.getLongitude());
        entity.setState(dto.getState());
        entity.setCity(dto.getCity());
        entity.setLocationDescription(dto.getLocationDescription());
        entity.setRoadType(dto.getRoadType());
        entity.setWeatherCondition(dto.getWeatherCondition());
        entity.setLightingCondition(dto.getLightingCondition());
        entity.setRoadSurfaceCondition(dto.getRoadSurfaceCondition());
        entity.setVehicleCount(dto.getVehicleCount() != null ? dto.getVehicleCount() : 1);
        entity.setCasualtyCount(dto.getCasualtyCount() != null ? dto.getCasualtyCount() : 0);
        entity.setInjuryCount(dto.getInjuryCount() != null ? dto.getInjuryCount() : 0);
        entity.setSpeedLimit(dto.getSpeedLimit());
        entity.setAreaType(dto.getAreaType() != null ? dto.getAreaType() : "Urban");
        entity.setSeverity(dto.getSeverity());
    }
}
