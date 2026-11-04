import axiosInstance from "./axiosInstance";
const api = axiosInstance;
export async function fetchAllUsers() { const res = await api.get("/auth/users"); const d = res.data; let arr = []; if (Array.isArray(d)) arr = d; else if (d && Array.isArray(d.data)) arr = d.data; else if (d && d.success && d.data && Array.isArray(d.data)) arr = d.data; else if (d && d.data && Array.isArray(d.data.data)) arr = d.data.data; else if (d && Array.isArray(d.users)) arr = d.users; else if (d && d.data && Array.isArray(d.data.users)) arr = d.data.users; return arr; }
export async function fetchUser(id) { return api.get(`/auth/users/${id}`).then(r => r.data); }
export async function createUser(data) { return api.post("/auth/users", data).then(r => r.data); }
export async function updateUser(id, data) { return api.put(`/auth/users/${id}`, data).then(r => r.data); }
export async function deleteUser(id) { return api.delete(`/auth/users/${id}`).then(r => r.data); }
