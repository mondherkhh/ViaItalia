import axiosInstance from './axiosInstance';

const list = params => axiosInstance.get('/university-programs', { params });
const sync = (params = {}) => axiosInstance.post('/university-programs/sync', params);
const create = data => axiosInstance.post('/university-programs', data);
export default { list, sync, create };
