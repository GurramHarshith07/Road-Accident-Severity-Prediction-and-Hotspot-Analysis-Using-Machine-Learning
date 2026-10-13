package com.roadaccident.service;

import com.roadaccident.dto.UploadResponseDto;
import com.roadaccident.entity.Accident;
import com.roadaccident.repository.AccidentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class DatasetUploadService {

    private final AccidentRepository accidentRepository;

    public DatasetUploadService(AccidentRepository accidentRepository) {
        this.accidentRepository = accidentRepository;
    }

    public static final String SAMPLE_CSV_TEMPLATE =
            "accident_date,accident_time,latitude,longitude,state,city,location_description,road_type,weather_condition,lighting_condition,road_surface_condition,vehicle_count,casualty_count,injury_count,speed_limit,area_type,severity\n" +
            "2024-03-15,18:30:00,28.6139391,77.2090212,Delhi,New Delhi,Connaught Place Outer Circle,Roundabout,Fine,Darkness - lights lit,Dry,2,0,1,50,Urban,Minor\n" +
            "2024-03-16,21:15:00,19.0759837,72.8776559,Maharashtra,Mumbai,Western Express Highway Bandra,Dual Carriageway,Raining,Darkness - lights lit,Wet/Damp,3,1,2,80,Urban,Fatal\n" +
            "2024-03-17,09:45:00,12.9715987,77.5945627,Karnataka,Bengaluru,Hosur Road Silk Board Junction,Single Carriageway,Fine,Daylight,Dry,2,0,1,60,Urban,Serious\n" +
            "2024-03-18,14:20:00,17.3850440,78.4866710,Telangana,Hyderabad,Outer Ring Road Gachibowli,Dual Carriageway,Fine,Daylight,Dry,1,0,0,100,Rural,Minor\n";

    @Transactional
    public UploadResponseDto processCsvUpload(MultipartFile file, boolean dryRun) {
        UploadResponseDto response = new UploadResponseDto();
        List<Accident> validAccidents = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        if (file.isEmpty()) {
            errors.add("Uploaded file is empty.");
            response.setErrors(errors);
            return response;
        }

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String headerLine = reader.readLine();
            if (headerLine == null) {
                errors.add("CSV file has no header line.");
                response.setErrors(errors);
                return response;
            }

            // Remove BOM if present
            if (headerLine.startsWith("\uFEFF")) {
                headerLine = headerLine.substring(1);
            }

            String[] rawHeaders = headerLine.split(",");
            Map<String, Integer> headerMap = new HashMap<>();
            List<String> cleanHeaders = new ArrayList<>();
            for (int i = 0; i < rawHeaders.length; i++) {
                String cleanHeader = rawHeaders[i].trim().toLowerCase().replaceAll("[^a-z0-9_]", "");
                headerMap.put(cleanHeader, i);
                cleanHeaders.add(rawHeaders[i].trim());
            }
            response.setPreviewColumns(cleanHeaders);

            // Validate mandatory column presence
            List<String> requiredCols = List.of("latitude", "longitude", "city", "road_type", "severity");
            for (String req : requiredCols) {
                if (!headerMap.containsKey(req)) {
                    errors.add("Missing required column: " + req);
                }
            }

            if (!errors.isEmpty()) {
                response.setErrors(errors);
                return response;
            }

            String line;
            int rowIndex = 1;
            List<List<String>> previewRows = new ArrayList<>();

            while ((line = reader.readLine()) != null) {
                rowIndex++;
                if (line.trim().isEmpty()) continue;

                String[] values = parseCsvLine(line);
                if (values.length < rawHeaders.length) {
                    errors.add("Row " + rowIndex + ": Insufficient columns (expected " + rawHeaders.length + ", found " + values.length + ")");
                    continue;
                }

                if (previewRows.size() < 5) {
                    previewRows.add(Arrays.asList(values));
                }

                try {
                    Accident accident = parseAccidentRow(values, headerMap, rowIndex);
                    validAccidents.add(accident);
                } catch (Exception ex) {
                    if (errors.size() < 20) {
                        errors.add("Row " + rowIndex + ": " + ex.getMessage());
                    }
                }
            }

            response.setTotalRows(rowIndex - 1);
            response.setValidRows(validAccidents.size());
            response.setRejectedRows((rowIndex - 1) - validAccidents.size());
            response.setPreviewRows(previewRows);
            response.setErrors(errors);

            if (!dryRun && !validAccidents.isEmpty()) {
                // Batch insert into database
                int batchSize = 100;
                for (int i = 0; i < validAccidents.size(); i += batchSize) {
                    int end = Math.min(i + batchSize, validAccidents.size());
                    accidentRepository.saveAll(validAccidents.subList(i, end));
                }
                response.setInsertedRows(validAccidents.size());
            } else {
                response.setInsertedRows(0);
            }

        } catch (Exception ex) {
            errors.add("Failed to parse CSV file: " + ex.getMessage());
            response.setErrors(errors);
        }

        return response;
    }

    private Accident parseAccidentRow(String[] values, Map<String, Integer> headerMap, int rowIndex) {
        Accident a = new Accident();

        // Date
        String dateStr = getVal(values, headerMap, "accident_date", "date");
        if (dateStr == null || dateStr.isBlank()) {
            a.setAccidentDate(LocalDate.now());
        } else {
            a.setAccidentDate(parseFlexibleDate(dateStr));
        }

        // Time
        String timeStr = getVal(values, headerMap, "accident_time", "time");
        if (timeStr == null || timeStr.isBlank()) {
            a.setAccidentTime(LocalTime.of(12, 0));
        } else {
            a.setAccidentTime(parseFlexibleTime(timeStr));
        }

        // Coordinates
        String latStr = getVal(values, headerMap, "latitude", "lat");
        String lonStr = getVal(values, headerMap, "longitude", "lng", "lon");
        if (latStr == null || lonStr == null) {
            throw new IllegalArgumentException("Missing coordinate values");
        }
        double lat = Double.parseDouble(latStr.trim());
        double lon = Double.parseDouble(lonStr.trim());
        if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
            throw new IllegalArgumentException("Coordinates out of valid range: (" + lat + ", " + lon + ")");
        }
        a.setLatitude(BigDecimal.valueOf(lat));
        a.setLongitude(BigDecimal.valueOf(lon));

        // State & City
        a.setState(getValOrDefault(values, headerMap, "state", "Unknown State"));
        a.setCity(getValOrDefault(values, headerMap, "city", "Unknown City"));
        a.setLocationDescription(getValOrDefault(values, headerMap, "location_description", "location", a.getCity()));

        // Road, Weather, Lighting, Surface
        a.setRoadType(getValOrDefault(values, headerMap, "road_type", "Single Carriageway"));
        a.setWeatherCondition(getValOrDefault(values, headerMap, "weather_condition", "weather", "Fine"));
        a.setLightingCondition(getValOrDefault(values, headerMap, "lighting_condition", "lighting", "Daylight"));
        a.setRoadSurfaceCondition(getValOrDefault(values, headerMap, "road_surface_condition", "surface", "Dry"));

        // Vehicle, Casualty, Injury counts
        a.setVehicleCount(parseIntOrDefault(getVal(values, headerMap, "vehicle_count", "vehicles"), 1));
        a.setCasualtyCount(parseIntOrDefault(getVal(values, headerMap, "casualty_count", "casualties"), 0));
        a.setInjuryCount(parseIntOrDefault(getVal(values, headerMap, "injury_count", "injuries"), 0));
        a.setSpeedLimit(parseIntOrDefault(getVal(values, headerMap, "speed_limit", "speed"), 50));
        a.setAreaType(getValOrDefault(values, headerMap, "area_type", "area", "Urban"));

        // Severity
        String sev = getValOrDefault(values, headerMap, "severity", "Minor");
        if (sev.equalsIgnoreCase("1") || sev.equalsIgnoreCase("fatal")) sev = "Fatal";
        else if (sev.equalsIgnoreCase("2") || sev.equalsIgnoreCase("serious")) sev = "Serious";
        else sev = "Minor";
        a.setSeverity(sev);

        return a;
    }

    private LocalDate parseFlexibleDate(String str) {
        str = str.trim();
        List<DateTimeFormatter> formatters = List.of(
                DateTimeFormatter.ISO_LOCAL_DATE,
                DateTimeFormatter.ofPattern("dd/MM/yyyy"),
                DateTimeFormatter.ofPattern("dd-MM-yyyy"),
                DateTimeFormatter.ofPattern("MM/dd/yyyy"),
                DateTimeFormatter.ofPattern("yyyy/MM/dd")
        );
        for (DateTimeFormatter fmt : formatters) {
            try {
                return LocalDate.parse(str, fmt);
            } catch (Exception ignored) {}
        }
        return LocalDate.now();
    }

    private LocalTime parseFlexibleTime(String str) {
        str = str.trim();
        try {
            if (str.length() == 5) str = str + ":00";
            return LocalTime.parse(str);
        } catch (Exception e) {
            return LocalTime.of(12, 0);
        }
    }

    private String getVal(String[] values, Map<String, Integer> headerMap, String... keys) {
        for (String k : keys) {
            Integer idx = headerMap.get(k.toLowerCase());
            if (idx != null && idx < values.length) {
                return values[idx].trim();
            }
        }
        return null;
    }

    private String getValOrDefault(String[] values, Map<String, Integer> headerMap, String key, String defaultVal) {
        String val = getVal(values, headerMap, key);
        return (val != null && !val.isBlank()) ? val : defaultVal;
    }

    private String getValOrDefault(String[] values, Map<String, Integer> headerMap, String key1, String key2, String defaultVal) {
        String val = getVal(values, headerMap, key1, key2);
        return (val != null && !val.isBlank()) ? val : defaultVal;
    }

    private int parseIntOrDefault(String val, int defaultVal) {
        if (val == null || val.isBlank()) return defaultVal;
        try {
            return Integer.parseInt(val.trim());
        } catch (Exception e) {
            return defaultVal;
        }
    }

    private String[] parseCsvLine(String line) {
        List<String> tokens = new ArrayList<>();
        StringBuilder sb = new StringBuilder();
        boolean inQuotes = false;
        for (char c : line.toCharArray()) {
            if (c == '"') {
                inQuotes = !inQuotes;
            } else if (c == ',' && !inQuotes) {
                tokens.add(sb.toString().trim());
                sb.setLength(0);
            } else {
                sb.append(c);
            }
        }
        tokens.add(sb.toString().trim());
        return tokens.toArray(new String[0]);
    }
}
