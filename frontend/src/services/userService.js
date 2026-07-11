import axiosClient from '../api/axiosClient';

export const userService = {
  getUsers() {
    return axiosClient.get('/api/users');
  },
  getUserById(id) {
    return axiosClient.get(`/api/users?id=${id}`);
  },
  createUser(data) {
    return axiosClient.post('/api/users', data);
  },
  updateUser(data) {
    return axiosClient.put('/api/users', data);
  },
  deleteUser(id) {
    return axiosClient.delete(`/api/users?id=${id}`);
  },
};
