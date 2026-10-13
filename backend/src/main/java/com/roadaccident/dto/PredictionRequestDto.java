package com.roadaccident.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class PredictionRequestDto {

    @NotNull(message = "Hour of accident is required")
    @Min(value = 0, message = "Hour must be between 0 and 23")
    @Max(value = 23, message = "Hour must be between 0 and 23")
    private Integer hour;

    @NotBlank(message = "Day of week is required")
    private String dayOfWeek;

    @NotBlank(message = "Road type is required")
    private String roadType;

    @NotBlank(message = "Weather condition is required")
    private String weatherCondition;

    @NotBlank(message = "Lighting condition is required")
    private String lightingCondition;

    @NotBlank(message = "Road surface condition is required")
    private String roadSurfaceCondition;

    @NotNull(message = "Vehicle count is required")
    @Min(value = 1, message = "At least 1 vehicle must be involved")
    private Integer vehicleCount = 1;

    private Integer speedLimit = 50;

    @NotBlank(message = "Area type is required (Urban / Rural)")
    private String areaType = "Urban";

    private String modelName = "Random Forest";

    public PredictionRequestDto() {}

    // Getters and Setters
    public Integer getHour() { return hour; }
    public void setHour(Integer hour) { this.hour = hour; }

    public String getDayOfWeek() { return dayOfWeek; }
    public void setDayOfWeek(String dayOfWeek) { this.dayOfWeek = dayOfWeek; }

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

    public Integer getSpeedLimit() { return speedLimit; }
    public void setSpeedLimit(Integer speedLimit) { this.speedLimit = speedLimit; }

    public String getAreaType() { return areaType; }
    public void setAreaType(String areaType) { this.areaType = areaType; }

    public String getModelName() { return modelName; }
    public void setModelName(String modelName) { this.modelName = modelName; }
}
