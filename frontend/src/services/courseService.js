import axiosClient from '../api/axiosClient';

export const courseService = {
  getCourses() {
    return axiosClient.get('/api/courses');
  },
  getCourse(id) {
    return axiosClient.get(`/api/courses?id=${id}`);
  },
  createCourse(data) {
    return axiosClient.post('/api/courses', data);
  },
  updateCourse(data) {
    return axiosClient.put('/api/courses', data);
  },
  deleteCourse(id) {
    return axiosClient.delete(`/api/courses?id=${id}`);
  },
};
