import axiosClient from '../api/axiosClient';

export const userService = {
  getUsers() {
    return axiosClient.get('/users');
  },
  getUserById(id) {
    return axiosClient.get(`/users?id=${id}`);
  },
  createUser(data) {
    return axiosClient.post('/users', data);
  },
  updateUser(data) {
    return axiosClient.put('/users', data);
  },
  deleteUser(id) {
    return axiosClient.delete(`/users?id=${id}`);
  },
  changePassword(oldPassword, newPassword) {
    return axiosClient.post('/auth/change-password', {
      old_password: oldPassword,
      new_password: newPassword,
    });
  },
};
