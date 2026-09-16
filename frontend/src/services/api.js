import axios from 'axios';

export const API_BASE = 'http://127.0.0.1:8000/api';
export const WS_URL = 'ws://127.0.0.1:8000/ws';

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

export const api = {
  // Buses
  getBuses: () => apiClient.get('/buses').then(r => r.data),
  getBusById: (id) => apiClient.get(`/buses/${id}`).then(r => r.data),

  // Defects
  getDefects: (status) => apiClient.get('/events/defects', { params: { status } }).then(r => r.data),
  updateDefectStatus: (id, status) => apiClient.patch(`/events/defects/${id}/status`, { status }).then(r => r.data),
  triggerDefect: (payload) => apiClient.post('/events/trigger-defect', payload).then(r => r.data),

  // Alerts & Incidents
  getAlerts: (status) => apiClient.get('/alerts', { params: { status } }).then(r => r.data),
  getAlertById: (id) => apiClient.get(`/alerts/${id}`).then(r => r.data),
  updateAlertStatus: (id, status, notes) => apiClient.patch(`/alerts/${id}`, { status, notes }).then(r => r.data),
  triggerIncident: (payload) => apiClient.post('/alerts/trigger', payload).then(r => r.data),
  getIncidentPdfUrl: (id) => `${API_BASE}/alerts/${id}/pdf`,

  // Analytics
  getKPIs: () => apiClient.get('/analytics/kpis').then(r => r.data),
  getDefectsByType: () => apiClient.get('/analytics/defects-by-type').then(r => r.data),
  getRecurrenceBreakdown: () => apiClient.get('/analytics/recurrence-breakdown').then(r => r.data),
  getHourlyIncidents: () => apiClient.get('/analytics/hourly-incidents').then(r => r.data),
  getFleetMetrics: () => apiClient.get('/analytics/fleet-metrics').then(r => r.data),
  getRoadQualityIndex: () => apiClient.get('/analytics/road-quality-index').then(r => r.data),
  getCongestionCorridors: () => apiClient.get('/analytics/congestion-corridors').then(r => r.data),

  // Edge AI Detection
  processBase64Frame: (payload) => apiClient.post('/detection/process-base64', payload).then(r => r.data),
  uploadImageFile: (file, busId = 'ASTRA-103') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bus_id', busId);
    return apiClient.post('/detection/process-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(r => r.data);
  }
};
