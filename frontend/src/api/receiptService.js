import axiosInstance from './axiosInstance';
export const getReceipts = params => axiosInstance.get('/receipts', { params });
export const getReceiptStats = () => axiosInstance.get('/receipts/stats');
export const createReceipt = data => axiosInstance.post('/receipts', data);
export const getMyReceipts = () => axiosInstance.get('/receipts/mine');
export const getReceipt = id => axiosInstance.get(`/receipts/${id}`);
export default { getReceipts, getReceiptStats, createReceipt, getMyReceipts, getReceipt };
