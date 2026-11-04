import axiosInstance from "./axiosInstance";

export async function getOffices() {
  try {
    const res = await axiosInstance.get("/offices");
    return { success: true, data: Array.isArray(res.data) ? res.data : (res.data?.data || []) };
  } catch (e) {
    return { success: false, error: e?.response?.data?.message || e.message };
  }
}
export async function createOffice(data) {
  try {
    const res = await axiosInstance.post("/offices", data);
    return { success: true, data: res.data?.data || res.data };
  } catch (e) {
    return { success: false, message: e?.response?.data?.message || e.message };
  }
}
export async function updateOffice(id, data) {
  try {
    const res = await axiosInstance.patch(`/offices/${id}`, data);
    return { success: true, data: res.data?.data || res.data };
  } catch (e) {
    return { success: false, message: e?.response?.data?.message || e.message };
  }
}
export async function deleteOffice(id) {
  try {
    const res = await axiosInstance.delete(`/offices/${id}`);
    return { success: true, data: res.data };
  } catch (e) {
    return { success: false, message: e?.response?.data?.message || e.message };
  }
}
