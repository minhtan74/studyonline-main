import axiosClient from '../api/axiosClient';

export const authService = {
  login(email, password) {
    return axiosClient.post('/api/auth/login', { email, password });
  },
  register(fullname, email, password, confirm_password) {
    return axiosClient.post('/api/auth/register', { fullname, email, password, confirm_password });
  },
  logout() {
    return axiosClient.post('/api/auth/logout');
  },
  me() {
    return axiosClient.get('/api/auth/me');
  },
};
