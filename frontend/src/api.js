import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.message || err.message || 'Request failed';
    return Promise.reject(new Error(msg));
  }
);

export default api;

// ── Accidents ──────────────────────────────────────────────
export const getAccidents = (params) => api.get('/api/accidents', { params });
export const getAccidentById = (id) => api.get(`/api/accidents/${id}`);
export const createAccident = (data) => api.post('/api/accidents', data);
export const updateAccident = (id, data) => api.put(`/api/accidents/${id}`, data);
export const deleteAccident = (id) => api.delete(`/api/accidents/${id}`);
export const getAccidentsForMap = () => api.get('/api/accidents/map');
export const getCities = () => api.get('/api/accidents/cities');

// ── Dashboard ──────────────────────────────────────────────
export const getDashboardSummary = () => api.get('/api/dashboard/summary');

// ── Predictions ────────────────────────────────────────────
export const predictSeverity = (data) => api.post('/api/predictions', data);
export const getPredictions = (params) => api.get('/api/predictions', { params });

// ── Hotspots ───────────────────────────────────────────────
export const getHotspots = () => api.get('/api/hotspots');
export const analyzeHotspots = (data) => api.post('/api/hotspots/analyze', data);

// ── Analytics ──────────────────────────────────────────────
export const getSeverityAnalytics = () => api.get('/api/analytics/severity');
export const getTimeAnalytics = () => api.get('/api/analytics/time');
export const getRoadTypeAnalytics = () => api.get('/api/analytics/road-types');
export const getWeatherAnalytics = () => api.get('/api/analytics/weather');
export const getCityStatistics = () => api.get('/api/analytics/cities');
export const getAreaStatistics = () => api.get('/api/analytics/areas');

// ── Dataset Upload ─────────────────────────────────────────
export const uploadDataset = (file, dryRun = false) => {
  const form = new FormData();
  form.append('file', file);
  return api.post(`/api/datasets/upload?dryRun=${dryRun}`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  });
};
export const downloadTemplate = () =>
  api.get('/api/datasets/template', { responseType: 'blob' });

// ── Model Evaluations ──────────────────────────────────────
export const getModelEvaluations = () => api.get('/api/models/evaluation');
export const syncModelEvaluations = () => api.post('/api/models/evaluation/sync');
