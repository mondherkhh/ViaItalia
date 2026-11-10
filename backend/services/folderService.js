const axios = require("axios");
const base = "http://localhost:5000/api"; // adjust if proxy different
exports.getFolders = (dossierId) => axios.get(`${base}/dossiers/${dossierId}/folders`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }).then(r => r.data);
exports.createFolder = (payload) => axios.post(`${base}/folders`, payload, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }).then(r => r.data);
exports.renameFolder = (id, payload) => axios.patch(`${base}/folders/${id}`, payload, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }).then(r => r.data);
exports.deleteFolder = (id) => axios.delete(`${base}/folders/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }).then(r => r.data);
