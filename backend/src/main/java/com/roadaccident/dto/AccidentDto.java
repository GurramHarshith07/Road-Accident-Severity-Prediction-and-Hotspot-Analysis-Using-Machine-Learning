package com.roadaccident.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public class AccidentDto {

    private Long id;

    @NotNull(message = "Accident date is required")
    private LocalDate accidentDate;

    @NotNull(message = "Accident time is required")
    private LocalTime accidentTime;

    @NotNull(message = "Latitude is required")
    @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90")
    @DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90")
    private BigDecimal latitude;

    @NotNull(message = "Longitude is required")
    @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180")
    @DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180")
    private BigDecimal longitude;

    @NotBlank(message = "State is required")
    private String state;

    @NotBlank(message = "City is required")
    private String city;

    private String locationDescription;

    @NotBlank(message = "Road type is required")
    private String roadType;

    @NotBlank(message = "Weather condition is required")
    private String weatherCondition;

    @NotBlank(message = "Lighting condition is required")
    private String lightingCondition;

    @NotBlank(message = "Road surface condition is required")
    private String roadSurfaceCondition;

    @NotNull(message = "Vehicle count is required")
    private Integer vehicleCount = 1;

    @NotNull(message = "Casualty count is required")
    private Integer casualtyCount = 0;

    @NotNull(message = "Injury count is required")
    private Integer injuryCount = 0;

    private Integer speedLimit;

    @NotBlank(message = "Area type is required")
    private String areaType = "Urban";

    @NotBlank(message = "Severity is required (Minor, Serious, Fatal)")
    private String severity;

    public AccidentDto() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDate getAccidentDate() { return accidentDate; }
    public void setAccidentDate(LocalDate accidentDate) { this.accidentDate = accidentDate; }

    public LocalTime getAccidentTime() { return accidentTime; }
    public void setAccidentTime(LocalTime accidentTime) { this.accidentTime = accidentTime; }

    public BigDecimal getLatitude() { return latitude; }
    public void setLatitude(BigDecimal latitude) { this.latitude = latitude; }

    public BigDecimal getLongitude() { return longitude; }
    public void setLongitude(BigDecimal longitude) { this.longitude = longitude; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getLocationDescription() { return locationDescription; }
    public void setLocationDescription(String locationDescription) { this.locationDescription = locationDescription; }

    public String getRoadType() { return roadType; }
    public void setRoadType(String roadType) { this.roadType = roadType; }

    public String getWeatherCondition() { return weatherCondition; }
    public void setWeatherCondition(String weatherCondition) { this.weatherCondition = weatherCondition; }

    public String getLightingCondition() { return lightingCondition; }
    public void setLightingCondition(String lightingCondition) { this.lightingCondition = lightingCondition; }

    public String getRoadSurfaceCondition() { return roadSurfaceCondition; }
    public void setRoadSurfaceCondition(String roadSurfaceCondition) { this.roadSurfaceCondition = roadSurfaceCondition; }

    public Integer getVehicleCount() { return vehicleCount; }
    public void setVehicleCount(Integer vehicleCount) { this.vehicleCount = vehicleCount; }

    public Integer getCasualtyCount() { return casualtyCount; }
    public void setCasualtyCount(Integer casualtyCount) { this.casualtyCount = casualtyCount; }

    public Integer getInjuryCount() { return injuryCount; }
    public void setInjuryCount(Integer injuryCount) { this.injuryCount = injuryCount; }

    public Integer getSpeedLimit() { return speedLimit; }
    public void setSpeedLimit(Integer speedLimit) { this.speedLimit = speedLimit; }

    public String getAreaType() { return areaType; }
    public void setAreaType(String areaType) { this.areaType = areaType; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }
}
