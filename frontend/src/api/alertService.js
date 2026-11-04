import axiosInstance from './axiosInstance';

export const getAlerts = (status) => axiosInstance.get('/alerts', { params: status ? { status } : {} }).then(r => r.data);
export const createAlert = (data) => axiosInstance.post('/alerts', data).then(r => r.data);
export const updateAlert = (id, data) => axiosInstance.patch(`/alerts/${id}`, data).then(r => r.data);
export const removeAlert = (id) => axiosInstance.post(`/alerts/${id}/delete`).then(r => r.data);
