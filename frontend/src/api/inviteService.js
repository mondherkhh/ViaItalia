import axiosInstance from './axiosInstance';

export async function getPublicInvite(token) {
  try {
    const res = await axiosInstance.get(`/public-invites/${encodeURIComponent(token)}`);
    return res.data;
  } catch (err) {
    return { success: false, message: err.response?.data?.message || 'Invite check failed', valid: false };
  }
}
