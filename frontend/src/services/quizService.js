import axiosClient from '../api/axiosClient';

export const quizService = {
  getQuizzes(courseId) {
    return courseId ? axiosClient.get(`/quizzes?course_id=${courseId}`) : axiosClient.get('/quizzes');
  },
  getQuiz(id) {
    return axiosClient.get(`/quizzes?id=${id}`);
  },
  createQuiz(data) {
    return axiosClient.post('/quizzes', data);
  },
  updateQuiz(data) {
    return axiosClient.put('/quizzes', data);
  },
  deleteQuiz(id) {
    return axiosClient.delete(`/quizzes?id=${id}`);
  },

  getQuestions(quizId) {
    return axiosClient.get(`/quizzes/questions?quiz_id=${quizId}`);
  },
  getQuestion(id) {
    return axiosClient.get(`/quizzes/questions?id=${id}`);
  },
  createQuestion(data) {
    return axiosClient.post('/quizzes/questions', data);
  },
  updateQuestion(data) {
    return axiosClient.put('/quizzes/questions', data);
  },
  deleteQuestion(id) {
    return axiosClient.delete(`/quizzes/questions?id=${id}`);
  },

  submitQuiz(quizId, answers) {
    return axiosClient.post('/quizzes/submit', { quiz_id: quizId, answers });
  },
};
