import axios from './axiosInstance';
export const getReceipts = params => axios.get('/receipts', { params });
export const getReceiptStats = () => axios.get('/receipts/stats');
export const createReceipt = data => axios.post('/receipts', data);
export const getMyReceipts = () => axios.get('/receipts/mine');
export const getReceipt = id => axios.get(`/receipts/${id}`);
export default { getReceipts, getReceiptStats, createReceipt, getMyReceipts, getReceipt };
