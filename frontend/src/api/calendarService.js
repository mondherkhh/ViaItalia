import axiosInstance from './axiosInstance';

export const getEvents = (from, to, owner = 'all') => axiosInstance.get(`/calendar?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&owner=${encodeURIComponent(owner)}`).then(r => r.data);
export const createEvent = (data) => axiosInstance.post('/calendar', data).then(r => r.data);
export const updateEvent = (id, data) => axiosInstance.patch(`/calendar/${id}`, data).then(r => r.data);
export const deleteEvent = (id) => axiosInstance.delete(`/calendar/${id}`).then(r => r.data);
export const getSummary = () => axiosInstance.get('/calendar/summary').then(r => r.data);
