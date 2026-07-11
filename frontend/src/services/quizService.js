import axiosClient from '../api/axiosClient';

export const quizService = {
  getQuizzes(courseId) {
    return courseId ? axiosClient.get(`/api/quizzes?course_id=${courseId}`) : axiosClient.get('/api/quizzes');
  },
  getQuiz(id) {
    return axiosClient.get(`/api/quizzes?id=${id}`);
  },
  createQuiz(data) {
    return axiosClient.post('/api/quizzes', data);
  },
  updateQuiz(data) {
    return axiosClient.put('/api/quizzes', data);
  },
  deleteQuiz(id) {
    return axiosClient.delete(`/api/quizzes?id=${id}`);
  },

  getQuestions(quizId) {
    return axiosClient.get(`/api/quizzes/questions?quiz_id=${quizId}`);
  },
  getQuestion(id) {
    return axiosClient.get(`/api/quizzes/questions?id=${id}`);
  },
  createQuestion(data) {
    return axiosClient.post('/api/quizzes/questions', data);
  },
  updateQuestion(data) {
    return axiosClient.put('/api/quizzes/questions', data);
  },
  deleteQuestion(id) {
    return axiosClient.delete(`/api/quizzes/questions?id=${id}`);
  },

  submitQuiz(quizId, answers) {
    return axiosClient.post('/api/quizzes/submit', { quiz_id: quizId, answers });
  },
};
