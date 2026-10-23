import axios from "axios";
import { getCookie, setCookie } from "utils/cookie.js";
import { getNewTokens } from "services/token.js";

const api = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
    headers: { "Content-Type": "application/json" }
});

api.interceptors.request.use((request) => {
    const accessToken = getCookie("accessToken");
    if (accessToken) request.headers.Authorization = `Bearer ${accessToken}`;
    return request;
}, (error) => Promise.reject(error));

api.interceptors.response.use((response) => response, async (error) => {
    const originalRequest = error?.config;
    if (error?.response?.status === 401 && originalRequest && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
            const res = await getNewTokens();
            if (res?.response) {
                setCookie(res.response.data);
                return api(originalRequest);
            }
        } catch (refreshError) {
            return Promise.reject(refreshError);
        }
    }
    return Promise.reject(error);
});

export default api;