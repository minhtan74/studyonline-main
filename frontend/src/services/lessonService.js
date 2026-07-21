import axiosClient from '../api/axiosClient';

export const lessonService = {
  getLessons(chapterId) {
    return axiosClient.get(`/lessons?chapter_id=${chapterId}`);
  },
  getLesson(id) {
    return axiosClient.get(`/lessons?id=${id}`);
  },
  createLesson(data) {
    return axiosClient.post('/lessons', data);
  },
  updateLesson(data) {
    return axiosClient.put('/lessons', data);
  },
  deleteLesson(id) {
    return axiosClient.delete(`/lessons?id=${id}`);
  },
};
