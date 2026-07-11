import axiosClient from '../api/axiosClient';

export const lessonService = {
  getLessons(chapterId) {
    return axiosClient.get(`/api/lessons?chapter_id=${chapterId}`);
  },
  getLesson(id) {
    return axiosClient.get(`/api/lessons?id=${id}`);
  },
  createLesson(data) {
    return axiosClient.post('/api/lessons', data);
  },
  updateLesson(data) {
    return axiosClient.put('/api/lessons', data);
  },
  deleteLesson(id) {
    return axiosClient.delete(`/api/lessons?id=${id}`);
  },
};
