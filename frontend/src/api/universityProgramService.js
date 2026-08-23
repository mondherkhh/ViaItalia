import axios from './axiosInstance';

const list = params => axios.get('/university-programs', { params });
const sync = (params = {}) => axios.post('/university-programs/sync', params);
const create = data => axios.post('/university-programs', data);

export default { list, sync, create };
