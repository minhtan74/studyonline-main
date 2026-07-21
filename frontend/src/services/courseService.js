import axiosClient from '../api/axiosClient';

export const courseService = {
  getCourses() {
    return axiosClient.get('/courses');
  },
  getCourse(id) {
    return axiosClient.get(`/courses?id=${id}`);
  },
  createCourse(data) {
    return axiosClient.post('/courses', data);
  },
  updateCourse(data) {
    return axiosClient.put('/courses', data);
  },
  deleteCourse(id) {
    return axiosClient.delete(`/courses?id=${id}`);
  },
};
