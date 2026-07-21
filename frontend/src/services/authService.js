import axiosClient from '../api/axiosClient';

export const authService = {
  login(email, password) {
    return axiosClient.post('/auth/login', { email, password });
  },
  register(fullname, email, password, confirm_password) {
    return axiosClient.post('/auth/register', { fullname, email, password, confirm_password });
  },
  logout() {
    return axiosClient.post('/auth/logout');
  },
  me() {
    return axiosClient.get('/auth/me');
  },
};
