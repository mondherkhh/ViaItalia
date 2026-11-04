import axiosInstance from "./axiosInstance";
export const getDocuments = async (dossierId) => { const res = await axiosInstance.get(`/documents/dossiers/${dossierId}/documents`); const payload = res.data; let arr = []; if (Array.isArray(payload)) arr = payload; else if (payload && Array.isArray(payload.data)) arr = payload.data; else if (payload && payload.data && Array.isArray(payload.data.data)) arr = payload.data.data; else if (payload && payload.success && Array.isArray(payload.data)) arr = payload.data; return arr; };
export const deleteDocument = (id) => axiosInstance.delete(`/documents/${id}`).then(r=>r.data);
export const uploadDocument = (formData) => axiosInstance.post('/documents/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r=>r.data);

// Student-specific endpoints (routes in studentDocumentRoutes.js)
export const getStudentDocuments = async () => {
  const res = await axiosInstance.get('/student/documents');
  const payload = res.data;
  let arr = [];
  if (Array.isArray(payload)) arr = payload;
  else if (payload && Array.isArray(payload.data)) arr = payload.data;
  else if (payload && payload.success && Array.isArray(payload.data)) arr = payload.data;
  return arr;
};
export const uploadStudentDocument = (formData, config = {}) => axiosInstance.post('/student/documents/upload', formData, config).then(r => r.data);
export const downloadStudentDocument = (id) => axiosInstance.get(`/student/documents/${id}/download`, { responseType: 'blob' }).then(r => r);
export const submitStudentDocument = (id) => axiosInstance.post(`/student/documents/${id}/submit`).then(r => r.data);
export const deleteStudentDocument = (id) => axiosInstance.delete(`/student/documents/${id}`).then(r => r.data);
