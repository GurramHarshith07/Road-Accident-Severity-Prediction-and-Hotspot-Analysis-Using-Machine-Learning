// Comprehensive mock dataset and demo simulation for Vercel / serverless deployments

export const DEMO_USERS = [
  { username: 'admin', password: 'password123', role: 'Administrator', name: 'Dr. Harshith (Admin)' },
  { username: 'analyst', password: 'password123', role: 'Traffic Safety Analyst', name: 'Safety Officer' },
  { username: 'demo', password: 'demo', role: 'Guest Researcher', name: 'Demo User' },
];

export const INITIAL_ACCIDENTS = [
  {
    id: 1,
    accidentDate: '2026-03-15',
    accidentTime: '18:30:00',
    latitude: 28.6139391,
    longitude: 77.2090212,
    state: 'Delhi',
    city: 'New Delhi',
    locationDescription: 'Connaught Place Outer Circle',
    roadType: 'Roundabout',
    weatherCondition: 'Fine',
    lightingCondition: 'Darkness - lights lit',
    roadSurfaceCondition: 'Dry',
    vehicleCount: 2,
    casualtyCount: 0,
    injuryCount: 1,
    speedLimit: 50,
    areaType: 'Urban',
    severity: 'Minor',
  },
  {
    id: 2,
    accidentDate: '2026-03-16',
    accidentTime: '21:15:00',
    latitude: 19.0759837,
    longitude: 72.8776559,
    state: 'Maharashtra',
    city: 'Mumbai',
    locationDescription: 'Western Express Highway Bandra',
    roadType: 'Dual Carriageway',
    weatherCondition: 'Raining',
    lightingCondition: 'Darkness - lights lit',
    roadSurfaceCondition: 'Wet/Damp',
    vehicleCount: 3,
    casualtyCount: 1,
    injuryCount: 2,
    speedLimit: 80,
    areaType: 'Urban',
    severity: 'Fatal',
  },
  {
    id: 3,
    accidentDate: '2026-03-17',
    accidentTime: '09:45:00',
    latitude: 12.9715987,
    longitude: 77.5945627,
    state: 'Karnataka',
    city: 'Bengaluru',
    locationDescription: 'Hosur Road Silk Board Junction',
    roadType: 'Single Carriageway',
    weatherCondition: 'Fine',
    lightingCondition: 'Daylight',
    roadSurfaceCondition: 'Dry',
    vehicleCount: 2,
    casualtyCount: 0,
    injuryCount: 1,
    speedLimit: 60,
    areaType: 'Urban',
    severity: 'Serious',
  },
  {
    id: 4,
    accidentDate: '2026-03-18',
    accidentTime: '14:20:00',
    latitude: 17.385044,
    longitude: 78.486671,
    state: 'Telangana',
    city: 'Hyderabad',
    locationDescription: 'Outer Ring Road Gachibowli',
    roadType: 'Dual Carriageway',
    weatherCondition: 'Fine',
    lightingCondition: 'Daylight',
    roadSurfaceCondition: 'Dry',
    vehicleCount: 1,
    casualtyCount: 0,
    injuryCount: 0,
    speedLimit: 100,
    areaType: 'Rural',
    severity: 'Minor',
  },
  {
    id: 5,
    accidentDate: '2026-03-19',
    accidentTime: '23:10:00',
    latitude: 18.5204303,
    longitude: 73.8567437,
    state: 'Maharashtra',
    city: 'Pune',
    locationDescription: 'Swargate ST Stand Chowk',
    roadType: 'Roundabout',
    weatherCondition: 'Fine',
    lightingCondition: 'Darkness - lights lit',
    roadSurfaceCondition: 'Dry',
    vehicleCount: 2,
    casualtyCount: 0,
    injuryCount: 1,
    speedLimit: 40,
    areaType: 'Urban',
    severity: 'Minor',
  },
  {
    id: 6,
    accidentDate: '2026-03-20',
    accidentTime: '02:30:00',
    latitude: 13.0826802,
    longitude: 80.2707184,
    state: 'Tamil Nadu',
    city: 'Chennai',
    locationDescription: 'Koyambedu Roundtana Junction',
    roadType: 'Roundabout',
    weatherCondition: 'Raining',
    lightingCondition: 'Darkness - no lights',
    roadSurfaceCondition: 'Wet/Damp',
    vehicleCount: 2,
    casualtyCount: 1,
    injuryCount: 1,
    speedLimit: 70,
    areaType: 'Urban',
    severity: 'Fatal',
  },
  {
    id: 7,
    accidentDate: '2026-03-21',
    accidentTime: '11:15:00',
    latitude: 28.5877911,
    longitude: 77.1959087,
    state: 'Delhi',
    city: 'New Delhi',
    locationDescription: 'Mukarba Chowk GT Karnal Road',
    roadType: 'Dual Carriageway',
    weatherCondition: 'Fog/Mist',
    lightingCondition: 'Daylight',
    roadSurfaceCondition: 'Dry',
    vehicleCount: 4,
    casualtyCount: 0,
    injuryCount: 3,
    speedLimit: 60,
    areaType: 'Urban',
    severity: 'Serious',
  },
  {
    id: 8,
    accidentDate: '2026-03-22',
    accidentTime: '19:40:00',
    latitude: 17.4161373,
    longitude: 78.4718353,
    state: 'Telangana',
    city: 'Hyderabad',
    locationDescription: 'Secunderabad Clock Tower',
    roadType: 'Single Carriageway',
    weatherCondition: 'Fine',
    lightingCondition: 'Darkness - lights lit',
    roadSurfaceCondition: 'Dry',
    vehicleCount: 2,
    casualtyCount: 0,
    injuryCount: 1,
    speedLimit: 50,
    areaType: 'Urban',
    severity: 'Minor',
  },
];

export const INITIAL_HOTSPOTS = [
  {
    id: 1,
    locationName: 'Sion Circle Junction, Mumbai',
    latitude: 19.0735481,
    longitude: 72.905884,
    accidentCount: 93,
    fatalAccidentCount: 6,
    seriousAccidentCount: 26,
    minorAccidentCount: 61,
    riskCategory: 'Critical Risk',
    analysisStartDate: '2025-09-14',
    analysisEndDate: '2026-10-08',
  },
  {
    id: 2,
    locationName: 'Silk Board Junction Hosur Road, Bengaluru',
    latitude: 12.9969481,
    longitude: 77.6183852,
    accidentCount: 68,
    fatalAccidentCount: 3,
    seriousAccidentCount: 15,
    minorAccidentCount: 50,
    riskCategory: 'Critical Risk',
    analysisStartDate: '2025-09-14',
    analysisEndDate: '2026-10-13',
  },
  {
    id: 3,
    locationName: 'Koyambedu Roundtana, Chennai',
    latitude: 13.1085056,
    longitude: 80.2691718,
    accidentCount: 67,
    fatalAccidentCount: 8,
    seriousAccidentCount: 17,
    minorAccidentCount: 42,
    riskCategory: 'Critical Risk',
    analysisStartDate: '2025-09-10',
    analysisEndDate: '2026-10-12',
  },
  {
    id: 4,
    locationName: 'Mukarba Chowk GT Karnal Road, Delhi',
    latitude: 28.5877911,
    longitude: 77.1959087,
    accidentCount: 65,
    fatalAccidentCount: 3,
    seriousAccidentCount: 14,
    minorAccidentCount: 48,
    riskCategory: 'Critical Risk',
    analysisStartDate: '2025-09-16',
    analysisEndDate: '2026-10-10',
  },
  {
    id: 5,
    locationName: 'Secunderabad Clock Tower, Hyderabad',
    latitude: 17.4161373,
    longitude: 78.4718353,
    accidentCount: 49,
    fatalAccidentCount: 3,
    seriousAccidentCount: 12,
    minorAccidentCount: 34,
    riskCategory: 'Critical Risk',
    analysisStartDate: '2025-09-15',
    analysisEndDate: '2026-10-08',
  },
  {
    id: 6,
    locationName: 'Hadapsar Gadital Chowk, Pune',
    latitude: 18.5145345,
    longitude: 73.8818137,
    accidentCount: 42,
    fatalAccidentCount: 2,
    seriousAccidentCount: 9,
    minorAccidentCount: 31,
    riskCategory: 'Critical Risk',
    analysisStartDate: '2025-09-14',
    analysisEndDate: '2026-09-15',
  },
];

export const INITIAL_MODELS = [
  {
    id: 1,
    modelName: 'Random Forest',
    modelVersion: '1.0.0',
    accuracy: 0.76,
    precisionScore: 0.7483,
    recallScore: 0.7056,
    macroF1Score: 0.7229,
    evaluationDetails: JSON.stringify({
      model_name: 'Random Forest',
      model_version: '1.0.0',
      accuracy: 0.76,
      precision: 0.7483,
      recall: 0.7056,
      macro_f1: 0.7229,
      confusion_matrix: [
        [376, 74, 0],
        [101, 330, 21],
        [0, 44, 54],
      ],
      class_metrics: {
        Minor: { precision: 0.7883, recall: 0.8356, f1: 0.8112 },
        Serious: { precision: 0.7366, recall: 0.7301, f1: 0.7333 },
        Fatal: { precision: 0.72, recall: 0.551, f1: 0.6243 },
      },
    }),
  },
  {
    id: 2,
    modelName: 'Logistic Regression',
    modelVersion: '1.0.0',
    accuracy: 0.748,
    precisionScore: 0.7063,
    recallScore: 0.7926,
    macroF1Score: 0.7321,
    evaluationDetails: JSON.stringify({
      model_name: 'Logistic Regression',
      model_version: '1.0.0',
      accuracy: 0.748,
      precision: 0.7063,
      recall: 0.7926,
      macro_f1: 0.7321,
      confusion_matrix: [
        [369, 81, 0],
        [89, 289, 74],
        [0, 8, 90],
      ],
      class_metrics: {
        Minor: { precision: 0.8057, recall: 0.82, f1: 0.8128 },
        Serious: { precision: 0.7646, recall: 0.6394, f1: 0.6964 },
        Fatal: { precision: 0.5488, recall: 0.9184, f1: 0.687 },
      },
    }),
  },
  {
    id: 3,
    modelName: 'Decision Tree',
    modelVersion: '1.0.0',
    accuracy: 0.726,
    precisionScore: 0.7144,
    recallScore: 0.6991,
    macroF1Score: 0.7056,
    evaluationDetails: JSON.stringify({
      model_name: 'Decision Tree',
      model_version: '1.0.0',
      accuracy: 0.726,
      precision: 0.7144,
      recall: 0.6991,
      macro_f1: 0.7056,
      confusion_matrix: [
        [362, 88, 0],
        [121, 303, 28],
        [2, 35, 61],
      ],
      class_metrics: {
        Minor: { precision: 0.7464, recall: 0.8044, f1: 0.7743 },
        Serious: { precision: 0.7113, recall: 0.6704, f1: 0.6902 },
        Fatal: { precision: 0.6854, recall: 0.6224, f1: 0.6524 },
      },
    }),
  },
];

// In-browser ML Inference simulator mirroring the trained Random Forest rules
export function simulateMLPrediction(data) {
  let score = 0;

  // Speed factor
  if (data.speedLimit >= 80) score += 4;
  else if (data.speedLimit >= 60) score += 2;

  // Lighting factor
  if (data.lightingCondition === 'Darkness - no lights') score += 4;
  else if (data.lightingCondition === 'Darkness - lights lit') score += 2;

  // Weather & Surface factor
  if (data.weatherCondition === 'Raining' || data.weatherCondition === 'Fog/Mist') score += 2;
  if (data.roadSurfaceCondition === 'Wet/Damp' || data.roadSurfaceCondition === 'Flooded') score += 2;

  // Night hours
  if (data.hour >= 21 || data.hour <= 5) score += 3;

  // Vehicles
  if (data.vehicleCount >= 3) score += 3;
  else if (data.vehicleCount === 2) score += 1;

  // Rural vs Urban
  if (data.areaType === 'Rural') score += 2;

  let predictedSeverity = 'Minor';
  let probs = { Minor: 0.75, Serious: 0.20, Fatal: 0.05 };

  if (score >= 9) {
    predictedSeverity = 'Fatal';
    probs = { Minor: 0.05, Serious: 0.18, Fatal: 0.77 };
  } else if (score >= 5) {
    predictedSeverity = 'Serious';
    probs = { Minor: 0.20, Serious: 0.65, Fatal: 0.15 };
  }

  const confidenceScore = probs[predictedSeverity];
  const explanation = `Prediction generated by ${data.modelName || 'Random Forest'} model based on: ` +
    `Speed limit (${data.speedLimit} km/h), lighting (${data.lightingCondition}), road surface (${data.roadSurfaceCondition}), ` +
    `weather (${data.weatherCondition}), vehicles involved (${data.vehicleCount}), and area type (${data.areaType}). ` +
    `Calculated highest-probability class: ${predictedSeverity} (${(confidenceScore * 100).toFixed(1)}% confidence).`;

  return {
    requestId: 'PRED-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
    predictedSeverity,
    confidenceScore,
    classProbabilities: probs,
    explanation,
    modelName: data.modelName || 'Random Forest',
    modelVersion: '1.0.0',
    timestamp: new Date().toISOString(),
    disclaimer: 'Predictions are statistical estimates based on historical machine learning training data and do not guarantee actual accident outcomes.',
  };
}
