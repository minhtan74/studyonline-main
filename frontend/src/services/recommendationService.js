import axiosClient from '../api/axiosClient';

/** PHASE 5 — Rule-based Personalized Recommendation. */
export const recommendationService = {
  startStudy(topicId) { return axiosClient.post('/api/recommendations/study', { topic_id: topicId }); },
  startKnowledgeStudy(unit, config = {}) {
    return axiosClient.post('/api/recommendations/study', { course_id: unit.course_id, knowledge_kind: unit.kind, unit_id: unit.id }, config);
  },
  progress(courseId) { return axiosClient.get('/api/recommendations/progress', { params: courseId ? { course_id: courseId } : {} }); },
  /** Gợi ý hiện tại (lời giải AI tự sinh & cache ở server) + lịch sử đã lưu. */
  get(courseId, config = {}) {
    return axiosClient.get(courseId ? `/api/recommendations?course_id=${courseId}` : '/api/recommendations', config);
  },
};
