import axiosInstance from "./axiosInstance";

const API_BASE = "/student-tasks";

function normalizeArray(res) {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (res.data && Array.isArray(res.data)) return res.data;
  if (res.data && Array.isArray(res.data.data)) return res.data.data;
  if (res.success && Array.isArray(res.data)) return res.data;
  return [];
}

export async function getTasks(userId) {
  const res = await axiosInstance.get(`${API_BASE}/user/${userId}`);
  return normalizeArray(res);
}

export async function createTask(data) {
  const res = await axiosInstance.post(API_BASE, data);
  return { success: !!(res.data && res.data.success !== false), data: res.data };
}

export async function updateTask(id, updates) {
  const res = await axiosInstance.patch(`${API_BASE}/${id}`, updates);
  return { success: !!(res.data && res.data.success !== false), data: res.data };
}

export async function deleteTask(id) {
  const res = await axiosInstance.delete(`${API_BASE}/${id}`);
  return { success: !!(res.data && res.data.success !== false), data: res.data };
}

export async function logPayment(id) {
  const res = await axiosInstance.post(`${API_BASE}/${id}/log-payment`, {});
  return { success: !!(res.data && res.data.success !== false), data: res.data };
}
