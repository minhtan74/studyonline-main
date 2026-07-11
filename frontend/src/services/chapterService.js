import axiosClient from '../api/axiosClient';

export const chapterService = {
  getChapters(courseId) {
    return axiosClient.get(`/api/chapters?course_id=${courseId}`);
  },
  getChapter(id) {
    return axiosClient.get(`/api/chapters?id=${id}`);
  },
  createChapter(data) {
    return axiosClient.post('/api/chapters', data);
  },
  updateChapter(data) {
    return axiosClient.put('/api/chapters', data);
  },
  deleteChapter(id) {
    return axiosClient.delete(`/api/chapters?id=${id}`);
  },
};
