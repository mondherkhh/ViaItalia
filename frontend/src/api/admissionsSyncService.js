import axiosInstance from './axiosInstance';

const start = field => {
  const selectedField = String(field || '').trim();
  return axiosInstance.post('/admissions-sync/start', {
    field: selectedField && selectedField !== 'ALL' ? selectedField : undefined
  });
};

const getStatus = jobId => axiosInstance.get(`/admissions-sync/${encodeURIComponent(jobId)}`);

const cancel = jobId => axiosInstance.delete(`/admissions-sync/${encodeURIComponent(jobId)}`);

export default { start, getStatus, cancel };
