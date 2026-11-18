import axios from "axios";
const staffApi = axios.create({ baseURL: import.meta.env.VITE_BASE_URL, headers: { "Content-Type": "application/json" } });
staffApi.interceptors.request.use(config => {
  const token = sessionStorage.getItem("tahaterStaffToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
export const staffLoginSendOtp = data => staffApi.post("staff/auth/send-otp", data);
export const staffLoginVerifyOtp = data => staffApi.post("staff/auth/verify-otp", data);
export const staffMe = () => staffApi.get("staff/auth/me");
export const staffLogout = () => staffApi.post("staff/auth/logout");
export const staffList = () => staffApi.get("staff/admin/staff");
export const staffCreate = data => staffApi.post("staff/admin/staff", data);
export const staffUpdate = (id, data) => staffApi.patch(`staff/admin/staff/${id}`, data);
export const staffSetActive = (id, isActive) => staffApi.patch(`staff/admin/staff/${id}/status`, { isActive });
export const staffRoles = () => staffApi.get("staff/admin/roles");
export const staffUpdateRole = (key, permissions) => staffApi.patch(`staff/admin/roles/${key}`, { permissions });
export const staffAuditLogs = () => staffApi.get("staff/admin/audit-logs");
export default staffApi;