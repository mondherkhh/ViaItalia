import axiosInstance from "./axiosInstance";

export async function getAgents() {
  try {
    const res = await axiosInstance.get("/agents");
    return { success: true, data: Array.isArray(res.data) ? res.data : (res.data?.data || []) };
  } catch (e) {
    return { success: false, error: e?.response?.data?.message || e.message };
  }
}
export async function createAgent(data) {
  try {
    const res = await axiosInstance.post("/agents", data);
    return { success: true, data: res.data?.data || res.data, temporaryPassword: res.data?.temporaryPassword || null };
  } catch (e) {
    return { success: false, message: e?.response?.data?.message || e.message, code: e?.response?.status };
  }
}
export async function updateAgent(id, data) {
  try {
    const res = await axiosInstance.patch(`/agents/${id}`, data);
    return { success: true, data: res.data?.data || res.data };
  } catch (e) {
    return { success: false, message: e?.response?.data?.message || e.message };
  }
}
export async function resetAgentPassword(id) {
  try {
    const res = await axiosInstance.patch(`/agents/${id}/password`, {});
    return { success: true, temporaryPassword: res.data?.temporaryPassword || null, message: res.data?.message || '' };
  } catch (e) {
    return { success: false, message: e?.response?.data?.message || e.message, code: e?.response?.status };
  }
}
export async function deleteAgent(id) {
  try {
    const res = await axiosInstance.delete(`/agents/${id}`);
    return { success: true, data: res.data };
  } catch (e) {
    return { success: false, message: e?.response?.data?.message || e.message };
  }
}
