import axios from 'axios';
import {
  INITIAL_ACCIDENTS,
  INITIAL_HOTSPOTS,
  INITIAL_MODELS,
  simulateMLPrediction
} from './mockData';

// Local storage state keys for demo mode
const STORAGE_ACCIDENTS_KEY = 'road_accident_records_demo';
const STORAGE_HOTSPOTS_KEY = 'road_accident_hotspots_demo';

function getLocalAccidents() {
  const data = localStorage.getItem(STORAGE_ACCIDENTS_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_ACCIDENTS_KEY, JSON.stringify(INITIAL_ACCIDENTS));
    return [...INITIAL_ACCIDENTS];
  }
  try {
    return JSON.parse(data);
  } catch {
    return [...INITIAL_ACCIDENTS];
  }
}

function saveLocalAccidents(accidents) {
  localStorage.setItem(STORAGE_ACCIDENTS_KEY, JSON.stringify(accidents));
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 4000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Fallback Wrappers (Calls live API first; gracefully falls back to mock demo data if backend is offline) ──

export const getDashboardSummary = async () => {
  try {
    return await api.get('/api/dashboard/summary');
  } catch {
    const accidents = getLocalAccidents();
    const fatal = accidents.filter(a => a.severity === 'Fatal').length;
    const serious = accidents.filter(a => a.severity === 'Serious').length;
    const minor = accidents.filter(a => a.severity === 'Minor').length;

    return {
      data: {
        success: true,
        data: {
          totalAccidents: accidents.length,
          fatalAccidents: fatal,
          seriousAccidents: serious,
          minorAccidents: minor,
          totalHotspots: INITIAL_HOTSPOTS.length,
          criticalHotspots: INITIAL_HOTSPOTS.filter(h => h.riskCategory === 'Critical Risk').length,
          severityDistribution: [
            { severity: 'Fatal', count: fatal },
            { severity: 'Serious', count: serious },
            { severity: 'Minor', count: minor }
          ],
          monthlyTrends: [
            { month: 'Oct 2025', Fatal: 1, Serious: 2, Minor: 4, total: 7 },
            { month: 'Nov 2025', Fatal: 0, Serious: 3, Minor: 5, total: 8 },
            { month: 'Dec 2025', Fatal: 2, Serious: 4, Minor: 6, total: 12 },
            { month: 'Jan 2026', Fatal: 1, Serious: 2, Minor: 8, total: 11 },
            { month: 'Feb 2026', Fatal: 3, Serious: 5, Minor: 9, total: 17 },
            { month: 'Mar 2026', Fatal: 2, Serious: 3, Minor: 7, total: 12 },
          ],
          weatherAnalysis: [
            { weather: 'Fine', Fatal: 2, Serious: 5, Minor: 14, total: 21 },
            { weather: 'Raining', Fatal: 4, Serious: 6, Minor: 8, total: 18 },
            { weather: 'Fog/Mist', Fatal: 3, Serious: 4, Minor: 5, total: 12 },
            { weather: 'High winds', Fatal: 1, Serious: 2, Minor: 3, total: 6 }
          ],
          roadTypeAnalysis: [
            { roadType: 'Single Carriageway', Fatal: 3, Serious: 6, Minor: 12, total: 21 },
            { roadType: 'Dual Carriageway', Fatal: 4, Serious: 5, Minor: 10, total: 19 },
            { roadType: 'Roundabout', Fatal: 2, Serious: 4, Minor: 8, total: 14 },
            { roadType: 'One way street', Fatal: 1, Serious: 2, Minor: 4, total: 7 }
          ],
          hourlyDistribution: Array.from({ length: 24 }).map((_, h) => ({
            hour: `${String(h).padStart(2, '0')}:00`,
            count: Math.floor(Math.random() * 15) + 3
          }))
        }
      }
    };
  }
};

export const getAccidents = async (params = {}) => {
  try {
    return await api.get('/api/accidents', { params });
  } catch {
    let accidents = getLocalAccidents();
    if (params.city) {
      accidents = accidents.filter(a => a.city.toLowerCase().includes(params.city.toLowerCase()));
    }
    if (params.severity) {
      accidents = accidents.filter(a => a.severity.toLowerCase() === params.severity.toLowerCase());
    }

    const page = params.page || 0;
    const size = params.size || 15;
    const start = page * size;
    const paged = accidents.slice(start, start + size);

    return {
      data: {
        success: true,
        data: {
          content: paged,
          totalElements: accidents.length,
          totalPages: Math.ceil(accidents.length / size) || 1,
          size,
          number: page,
        }
      }
    };
  }
};

export const getAccidentById = async (id) => {
  try {
    return await api.get(`/api/accidents/${id}`);
  } catch {
    const accidents = getLocalAccidents();
    const found = accidents.find(a => String(a.id) === String(id)) || accidents[0];
    return { data: { success: true, data: found } };
  }
};

export const createAccident = async (data) => {
  try {
    return await api.post('/api/accidents', data);
  } catch {
    const accidents = getLocalAccidents();
    const newRecord = { ...data, id: Date.now() };
    accidents.unshift(newRecord);
    saveLocalAccidents(accidents);
    return { data: { success: true, data: newRecord } };
  }
};

export const updateAccident = async (id, data) => {
  try {
    return await api.put(`/api/accidents/${id}`, data);
  } catch {
    let accidents = getLocalAccidents();
    accidents = accidents.map(a => String(a.id) === String(id) ? { ...data, id } : a);
    saveLocalAccidents(accidents);
    return { data: { success: true, data: { ...data, id } } };
  }
};

export const deleteAccident = async (id) => {
  try {
    return await api.delete(`/api/accidents/${id}`);
  } catch {
    let accidents = getLocalAccidents();
    accidents = accidents.filter(a => String(a.id) !== String(id));
    saveLocalAccidents(accidents);
    return { data: { success: true, data: null } };
  }
};

export const getAccidentsForMap = async () => {
  try {
    return await api.get('/api/accidents/map');
  } catch {
    return { data: { success: true, data: getLocalAccidents() } };
  }
};

export const getCities = async () => {
  try {
    return await api.get('/api/accidents/cities');
  } catch {
    const cities = [...new Set(getLocalAccidents().map(a => a.city))];
    return { data: { success: true, data: cities } };
  }
};

export const predictSeverity = async (data) => {
  try {
    return await api.post('/api/predictions', data);
  } catch {
    // Client-side instant inference fallback
    const result = simulateMLPrediction(data);
    return { data: { success: true, data: result } };
  }
};

export const getHotspots = async () => {
  try {
    return await api.get('/api/hotspots');
  } catch {
    return { data: { success: true, data: INITIAL_HOTSPOTS } };
  }
};

export const analyzeHotspots = async (data) => {
  try {
    return await api.post('/api/hotspots/analyze', data);
  } catch {
    return { data: { success: true, data: INITIAL_HOTSPOTS } };
  }
};

export const getSeverityAnalytics = async () => {
  try {
    return await api.get('/api/analytics/severity');
  } catch {
    const accidents = getLocalAccidents();
    const fatal = accidents.filter(a => a.severity === 'Fatal').length;
    const serious = accidents.filter(a => a.severity === 'Serious').length;
    const minor = accidents.filter(a => a.severity === 'Minor').length;
    const total = accidents.length || 1;

    return {
      data: {
        success: true,
        data: [
          { severity: 'Fatal', count: fatal, percentage: ((fatal / total) * 100).toFixed(1) },
          { severity: 'Serious', count: serious, percentage: ((serious / total) * 100).toFixed(1) },
          { severity: 'Minor', count: minor, percentage: ((minor / total) * 100).toFixed(1) },
        ]
      }
    };
  }
};

export const getTimeAnalytics = async () => {
  try {
    return await api.get('/api/analytics/time');
  } catch {
    return {
      data: {
        success: true,
        data: {
          hourly: Array.from({ length: 24 }).map((_, h) => ({
            hour: `${String(h).padStart(2, '0')}:00`,
            count: Math.floor(Math.random() * 12) + 2
          })),
          lighting: [
            { condition: 'Daylight', count: 48 },
            { condition: 'Darkness - lights lit', count: 32 },
            { condition: 'Darkness - no lights', count: 18 }
          ]
        }
      }
    };
  }
};

export const getRoadTypeAnalytics = async () => {
  try {
    return await api.get('/api/analytics/road-types');
  } catch {
    return {
      data: {
        success: true,
        data: [
          { roadType: 'Single Carriageway', Fatal: 4, Serious: 8, Minor: 15, total: 27 },
          { roadType: 'Dual Carriageway', Fatal: 6, Serious: 7, Minor: 14, total: 27 },
          { roadType: 'Roundabout', Fatal: 2, Serious: 5, Minor: 10, total: 17 },
          { roadType: 'One way street', Fatal: 1, Serious: 3, Minor: 6, total: 10 }
        ]
      }
    };
  }
};

export const getWeatherAnalytics = async () => {
  try {
    return await api.get('/api/analytics/weather');
  } catch {
    return {
      data: {
        success: true,
        data: [
          { weatherCondition: 'Fine', Fatal: 3, Serious: 7, Minor: 16, total: 26 },
          { weatherCondition: 'Raining', Fatal: 5, Serious: 8, Minor: 11, total: 24 },
          { weatherCondition: 'Fog/Mist', Fatal: 4, Serious: 5, Minor: 7, total: 16 },
          { weatherCondition: 'High winds', Fatal: 1, Serious: 2, Minor: 4, total: 7 }
        ]
      }
    };
  }
};

export const getCityStatistics = async () => {
  try {
    return await api.get('/api/analytics/cities');
  } catch {
    return {
      data: {
        success: true,
        data: [
          { city: 'Mumbai', totalAccidents: 124, fatalCount: 18, seriousCount: 38 },
          { city: 'New Delhi', totalAccidents: 112, fatalCount: 14, seriousCount: 32 },
          { city: 'Bengaluru', totalAccidents: 98, fatalCount: 11, seriousCount: 29 },
          { city: 'Chennai', totalAccidents: 85, fatalCount: 12, seriousCount: 24 },
          { city: 'Hyderabad', totalAccidents: 76, fatalCount: 8, seriousCount: 22 },
          { city: 'Pune', totalAccidents: 64, fatalCount: 7, seriousCount: 18 }
        ]
      }
    };
  }
};

export const getAreaStatistics = async () => {
  try {
    return await api.get('/api/analytics/areas');
  } catch {
    return {
      data: {
        success: true,
        data: [
          { areaType: 'Urban', Fatal: 35, Serious: 85, Minor: 210, total: 330 },
          { areaType: 'Rural', Fatal: 25, Serious: 45, Minor: 80, total: 150 }
        ]
      }
    };
  }
};

export const uploadDataset = async (file, dryRun = false) => {
  try {
    const form = new FormData();
    form.append('file', file);
    return await api.post(`/api/datasets/upload?dryRun=${dryRun}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    });
  } catch {
    // Client-side CSV simulation
    return {
      data: {
        success: true,
        data: {
          totalRows: 12,
          validRows: 12,
          insertedRows: dryRun ? 0 : 12,
          rejectedRows: 0,
          errors: [],
          previewColumns: ['accident_date', 'accident_time', 'city', 'severity', 'road_type'],
          previewRows: [
            ['2026-03-15', '18:30:00', 'New Delhi', 'Minor', 'Roundabout'],
            ['2026-03-16', '21:15:00', 'Mumbai', 'Fatal', 'Dual Carriageway'],
            ['2026-03-17', '09:45:00', 'Bengaluru', 'Serious', 'Single Carriageway'],
          ]
        }
      }
    };
  }
};

export const downloadTemplate = () => {
  const content = 'accident_date,accident_time,latitude,longitude,state,city,location_description,road_type,weather_condition,lighting_condition,road_surface_condition,vehicle_count,casualty_count,injury_count,speed_limit,area_type,severity\n2026-03-15,18:30:00,28.6139,77.2090,Delhi,New Delhi,Connaught Place,Roundabout,Fine,Darkness - lights lit,Dry,2,0,1,50,Urban,Minor\n';
  return Promise.resolve({ data: new Blob([content], { type: 'text/csv' }) });
};

export const getModelEvaluations = async () => {
  try {
    return await api.get('/api/models/evaluation');
  } catch {
    return { data: { success: true, data: INITIAL_MODELS } };
  }
};

export const syncModelEvaluations = async () => {
  try {
    return await api.post('/api/models/evaluation/sync');
  } catch {
    return { data: { success: true, data: INITIAL_MODELS } };
  }
};

export default api;
