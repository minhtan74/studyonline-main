import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://103.195.239.128:8000/api';

export const TOKEN_KEY = 'token';
export const USER_KEY = 'user';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  } catch {
    return null;
  }
}

export function setAuthStorage(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuthStorage() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

axiosClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Chuẩn hoá response giống Api.request() cũ: { ok, status, data }.
// Không throw ở luồng thường để các trang xử lý res.ok như bản gốc.
axiosClient.interceptors.response.use(
  (res) => ({ ok: true, status: res.status, data: res.data }),
  (error) => {
    if (error.response) {
      const { status, data, config } = error.response;
      const path = config?.url || '';
      if (status === 401 && !path.startsWith('/api/auth/')) {
        clearAuthStorage();
        window.location.href = '/login';
        return new Promise(() => {});
      }
      return { ok: false, status, data };
    }
    return {
      ok: false,
      status: 0,
      data: { success: false, message: 'Không thể kết nối tới máy chủ. Kiểm tra XAMPP đang chạy.' },
    };
  },
);

export default axiosClient;
