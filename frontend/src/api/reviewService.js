import axiosInstance from './axiosInstance';

const listApproved = (limit = 12) => axiosInstance.get('/reviews/approved', { params: { limit } });
const listMine = () => axiosInstance.get('/reviews/mine');
const create = data => axiosInstance.post('/reviews', data);
const createAdmin = data => axiosInstance.post('/reviews/admin', data);
const listAdmin = status => axiosInstance.get('/reviews/admin', { params: status ? { status } : {} });
const moderate = (id, data) => axiosInstance.patch(`/reviews/${id}/moderate`, data);
const remove = id => axiosInstance.post(`/reviews/admin/${id}/delete`);

export default { listApproved, listMine, create, createAdmin, listAdmin, moderate, remove };
