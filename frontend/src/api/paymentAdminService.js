import axiosInstance from './axiosInstance';
export const getPayments = params => axiosInstance.get('/payments-admin', { params });
export const getPaymentStats = () => axiosInstance.get('/payments/stats');
export const createPayment = data => axiosInstance.post('/payments', data);
export const updatePayment = (id, data) => axiosInstance.patch(`/payments/${id}`, data);
export const deletePayment = id => axiosInstance.delete(`/payments/${id}`).then(r=>r.data);
export const addPartialPayment = (id, data) => axiosInstance.post(`/payments/${id}/add-payment`, data);
export const getSummary = () => axiosInstance.get('/payments-admin/stats').then(r=>r.data);
