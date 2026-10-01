import axios from './axiosInstance';

const start = field => {
  const selectedField = String(field || '').trim();

  // ALL is the explicit manual-only full-sync mode. An empty value means ALL
  // as well, matching the backend contract and the reset/default UI state.
  return axios.post('/admissions-sync/start', {
    field: selectedField && selectedField !== 'ALL' ? selectedField : undefined
  });
};

const status = jobId => {
  if (!jobId) {
    return Promise.reject(new Error('Identifiant du job admissions manquant.'));
  }

  return axios.get(`/admissions-sync/${encodeURIComponent(jobId)}`);
};

const cancel = jobId => {
  if (!jobId) {
    return Promise.reject(new Error('Identifiant du job admissions manquant.'));
  }

  return axios.delete(`/admissions-sync/${encodeURIComponent(jobId)}`);
};

const admissionsSyncService = {
  start,
  status,
  cancel
};

export default admissionsSyncService;
