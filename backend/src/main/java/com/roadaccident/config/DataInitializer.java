package com.roadaccident.config;

import com.roadaccident.dto.HotspotAnalysisRequestDto;
import com.roadaccident.entity.Accident;
import com.roadaccident.repository.AccidentRepository;
import com.roadaccident.service.HotspotService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Configuration
public class DataInitializer implements CommandLineRunner {

    private final AccidentRepository accidentRepository;
    private final HotspotService hotspotService;

    public DataInitializer(AccidentRepository accidentRepository, HotspotService hotspotService) {
        this.accidentRepository = accidentRepository;
        this.hotspotService = hotspotService;
    }

    @Override
    public void run(String... args) throws Exception {
        if (accidentRepository.count() > 0) {
            System.out.println("Accident database already initialized with " + accidentRepository.count() + " records.");
            return;
        }

        System.out.println("Seeding database with realistic road accident records and spatial cluster coordinates...");
        List<Accident> seedRecords = generateRealisticAccidentRecords();
        accidentRepository.saveAll(seedRecords);
        System.out.println("Successfully seeded " + seedRecords.size() + " accident records.");

        // Automatically run initial DBSCAN hotspot analysis
        System.out.println("Generating initial spatial DBSCAN hotspots...");
        hotspotService.analyzeAndGenerateHotspots(new HotspotAnalysisRequestDto());
        System.out.println("Initial hotspots successfully generated!");
    }

    private List<Accident> generateRealisticAccidentRecords() {
        List<Accident> records = new ArrayList<>();
        Random random = new Random(42);

        // Clustered city hubs for realistic hotspot analysis
        record Hub(String city, String state, double centerLat, double centerLon, String[] spots) {}

        Hub[] hubs = new Hub[]{
                new Hub("New Delhi", "Delhi", 28.6139, 77.2090, new String[]{
                        "Connaught Place Outer Circle", "AIIMS Flyover Ring Road", "Dhaula Kuan Intersection",
                        "ITO Crossing Vikas Marg", "Kashmere Gate ISBT Junction", "Mukarba Chowk GT Karnal Road"
                }),
                new Hub("Mumbai", "Maharashtra", 19.0760, 72.8777, new String[]{
                        "Western Express Highway Bandra", "Eastern Express Highway Ghatkopar", "Sion Circle Junction",
                        "CST Railway Station Junction", "JVLR Powai Crossing", "Kalanagar Junction BKC"
                }),
                new Hub("Bengaluru", "Karnataka", 12.9716, 77.5946, new String[]{
                        "Silk Board Junction Hosur Road", "Hebbal Flyover Bellary Road", "Tin Factory Outer Ring Road",
                        "Marathahalli Bridge ORR", "Goraguntepalya Tumkur Road", "Sony World Signal Koramangala"
                }),
                new Hub("Hyderabad", "Telangana", 17.3850, 78.4867, new String[]{
                        "Cyber Towers Signal Madhapur", "Gachibowli ORR Junction", "Panjagutta Central Flyover",
                        "Secunderabad Clock Tower", "L.B. Nagar Ring Road Junction", "Ameerpet Metro Junction"
                }),
                new Hub("Pune", "Maharashtra", 18.5204, 73.8567, new String[]{
                        "Pune-Mumbai Expressway Wakad", "Shivajinagar Sancheti Bridge", "Swargate ST Stand Chowk",
                        "Hinjewadi Phase 1 Circle", "Hadapsar Gadital Chowk", "Katraj Tunnel NH48"
                }),
                new Hub("Chennai", "Tamil Nadu", 13.0827, 80.2707, new String[]{
                        "Kathipara Cloverleaf Guindy", "Koyambedu Roundtana", "Madhuravoyal Bypass",
                        "Anna Salai Gemini Flyover", "OMR Sholinganallur Signal", "Chromepet GST Road"
                })
        };

        String[] roadTypes = {"Single Carriageway", "Dual Carriageway", "Roundabout", "One way street"};
        String[] weatherConditions = {"Fine", "Raining", "Fog/Mist", "High winds"};
        String[] lightingConditions = {"Daylight", "Darkness - lights lit", "Darkness - no lights"};
        String[] roadSurfaces = {"Dry", "Wet/Damp", "Snow/Ice", "Flooded"};

        LocalDate today = LocalDate.now();

        for (Hub hub : hubs) {
            // Generate multiple distinct clusters in each hub
            for (int spotIdx = 0; spotIdx < hub.spots().length; spotIdx++) {
                String spot = hub.spots()[spotIdx];
                // Offset spot center slightly from city center (0.01 - 0.05 deg ~ 1-5km)
                double spotLat = hub.centerLat() + (random.nextDouble() - 0.5) * 0.08;
                double spotLon = hub.centerLon() + (random.nextDouble() - 0.5) * 0.08;

                // Density of records per spot: from 5 to 28 incidents
                int count = 5 + random.nextInt(24);

                for (int i = 0; i < count; i++) {
                    Accident a = new Accident();

                    // Cluster points with tightly bounded standard deviation (~200m to 600m)
                    double lat = spotLat + random.nextGaussian() * 0.003;
                    double lon = spotLon + random.nextGaussian() * 0.003;

                    a.setLatitude(BigDecimal.valueOf(lat));
                    a.setLongitude(BigDecimal.valueOf(lon));
                    a.setCity(hub.city());
                    a.setState(hub.state());
                    a.setLocationDescription(spot);

                    // Date spread across past 14 months
                    int daysAgo = random.nextInt(400);
                    a.setAccidentDate(today.minusDays(daysAgo));

                    // Time
                    int hour = random.nextInt(24);
                    int minute = random.nextInt(60);
                    a.setAccidentTime(LocalTime.of(hour, minute));

                    // Road, Weather, Lighting
                    a.setRoadType(roadTypes[random.nextInt(roadTypes.length)]);
                    a.setWeatherCondition(weatherConditions[random.nextInt(weatherConditions.length)]);
                    a.setLightingCondition(hour >= 6 && hour < 18 ? "Daylight" : lightingConditions[1 + random.nextInt(2)]);
                    a.setRoadSurfaceCondition(a.getWeatherCondition().equals("Raining") ? "Wet/Damp" : roadSurfaces[random.nextInt(roadSurfaces.length)]);

                    int vehicles = 1 + (random.nextDouble() > 0.4 ? 1 : 0) + (random.nextDouble() > 0.85 ? 1 : 0);
                    a.setVehicleCount(vehicles);
                    a.setSpeedLimit(random.nextBoolean() ? 50 : (random.nextBoolean() ? 60 : 80));
                    a.setAreaType(random.nextDouble() > 0.25 ? "Urban" : "Rural");

                    // Severity with weighted realistic probabilities
                    double sevRoll = random.nextDouble();
                    if (sevRoll < 0.08) {
                        a.setSeverity("Fatal");
                        a.setCasualtyCount(1 + (random.nextDouble() > 0.8 ? 1 : 0));
                        a.setInjuryCount(1 + random.nextInt(3));
                    } else if (sevRoll < 0.35) {
                        a.setSeverity("Serious");
                        a.setCasualtyCount(0);
                        a.setInjuryCount(1 + random.nextInt(2));
                    } else {
                        a.setSeverity("Minor");
                        a.setCasualtyCount(0);
                        a.setInjuryCount(random.nextDouble() > 0.5 ? 1 : 0);
                    }

                    records.add(a);
                }
            }
        }

        return records;
    }
}
