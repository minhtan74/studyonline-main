import axiosClient from '../api/axiosClient';

export const chapterService = {
  getChapters(courseId) {
    return axiosClient.get(`/chapters?course_id=${courseId}`);
  },
  getChapter(id) {
    return axiosClient.get(`/chapters?id=${id}`);
  },
  createChapter(data) {
    return axiosClient.post('/chapters', data);
  },
  updateChapter(data) {
    return axiosClient.put('/chapters', data);
  },
  deleteChapter(id) {
    return axiosClient.delete(`/chapters?id=${id}`);
  },
};
