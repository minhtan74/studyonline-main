const { success, error } = require('../utils/response');
const quizService = require('../services/quizService');
const questionService = require('../services/questionService');
const resultService = require('../services/resultService');

// ==================== QUIZ CRUD ====================

async function index(req, res) {
  const id = req.query.id ? parseInt(req.query.id, 10) : null;
  const courseId = req.query.course_id ? parseInt(req.query.course_id, 10) : null;

  if (id) {
    const quiz = await quizService.find(id);
    if (!quiz) {
      return error(res, 'Không tìm thấy quiz.', 404);
    }
    quiz.question_count = await questionService.countByQuiz(id);
    return success(res, { data: quiz });
  } else if (courseId) {
    const quizzes = await quizService.getByCourse(courseId);
    for (const q of quizzes) {
      q.question_count = await questionService.countByQuiz(q.id);
    }
    return success(res, { data: quizzes });
  } else {
    const quizzes = await quizService.getAll();
    for (const q of quizzes) {
      q.question_count = await questionService.countByQuiz(q.id);
    }
    return success(res, { data: quizzes });
  }
}

async function create(req, res) {
  const input = req.body || {};
  const courseId = parseInt(input.course_id ?? 0, 10);
  const title = String(input.title ?? '').trim();
  const description = String(input.description ?? '').trim();

  if (!courseId || !title) {
    return error(res, 'Dữ liệu không hợp lệ.');
  }

  const id = await quizService.create(courseId, title, description);
  return success(res, { id }, 'Tạo thành công');
}

async function update(req, res) {
  const input = req.body || {};
  const id = parseInt(input.id ?? 0, 10);
  const courseId = parseInt(input.course_id ?? 0, 10);
  const title = String(input.title ?? '').trim();
  const description = String(input.description ?? '').trim();

  if (!id || !courseId || !title) {
    return error(res, 'Dữ liệu không hợp lệ.');
  }

  await quizService.update(id, courseId, title, description);
  return success(res, [], 'Cập nhật thành công');
}

async function remove(req, res) {
  const id = parseInt(req.query.id ?? 0, 10);
  if (!id) {
    return error(res, 'Thiếu ID.');
  }

  await quizService.remove(id);
  return success(res, [], 'Xóa thành công');
}

// ==================== QUESTIONS CRUD ====================

async function indexQuestions(req, res) {
  const id = req.query.id ? parseInt(req.query.id, 10) : null;
  const quizId = req.query.quiz_id ? parseInt(req.query.quiz_id, 10) : null;

  if (id) {
    const q = await questionService.find(id);
    if (!q) {
      return error(res, 'Không tìm thấy câu hỏi.', 404);
    }
    return success(res, { data: q });
  } else if (quizId) {
    return success(res, { data: await questionService.getByQuiz(quizId) });
  }
  return error(res, 'Cần truyền quiz_id hoặc id.');
}

async function createQuestion(req, res) {
  const input = req.body || {};
  const quizId = parseInt(input.quiz_id ?? 0, 10);
  const content = String(input.content ?? '').trim();
  const optionA = String(input.option_a ?? '').trim();
  const optionB = String(input.option_b ?? '').trim();
  const optionC = String(input.option_c ?? '').trim();
  const optionD = String(input.option_d ?? '').trim();
  const correctAnswer = String(input.correct_answer ?? 'A').trim().toUpperCase();
  const orderIndex = parseInt(input.order_index ?? 0, 10);

  if (!quizId || !content) {
    return error(res, 'Dữ liệu không hợp lệ.');
  }

  await questionService.create(quizId, content, optionA, optionB, optionC, optionD, correctAnswer, orderIndex);
  return success(res, [], 'Thêm câu hỏi thành công');
}

async function updateQuestion(req, res) {
  const input = req.body || {};
  const id = parseInt(input.id ?? 0, 10);
  const content = String(input.content ?? '').trim();
  const optionA = String(input.option_a ?? '').trim();
  const optionB = String(input.option_b ?? '').trim();
  const optionC = String(input.option_c ?? '').trim();
  const optionD = String(input.option_d ?? '').trim();
  const correctAnswer = String(input.correct_answer ?? 'A').trim().toUpperCase();
  const orderIndex = parseInt(input.order_index ?? 0, 10);

  if (!id || !content) {
    return error(res, 'Dữ liệu không hợp lệ.');
  }

  await questionService.update(id, content, optionA, optionB, optionC, optionD, correctAnswer, orderIndex);
  return success(res, [], 'Cập nhật thành công');
}

async function deleteQuestion(req, res) {
  const id = parseInt(req.query.id ?? 0, 10);
  if (!id) {
    return error(res, 'Thiếu ID.');
  }

  await questionService.remove(id);
  return success(res, [], 'Xóa thành công');
}

// ==================== SUBMIT QUIZ ====================

async function submit(req, res) {
  const payload = req.user;
  const input = req.body || {};

  const quizId = parseInt(input.quiz_id ?? 0, 10);
  const answers = input.answers ?? {};

  const quiz = await quizService.find(quizId);
  const questions = await questionService.getByQuiz(quizId);

  if (!quiz || questions.length === 0) {
    return error(res, 'Quiz không tồn tại hoặc chưa có câu hỏi.', 404);
  }

  let score = 0;
  const total = questions.length;
  const details = [];

  for (const q of questions) {
    const chosen = String(answers[q.id] ?? '').toUpperCase();
    const correct = q.correct_answer;
    const isRight = chosen === correct;
    if (isRight) score++;
    details.push({
      question_id: q.id,
      content: q.content,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      chosen,
      correct_answer: correct,
      is_right: isRight,
    });
  }

  await resultService.store(payload.id, quizId, score, total);

  return success(res, {
    quiz,
    score,
    total,
    percent: total > 0 ? Math.round((score / total) * 100) : 0,
    details,
  });
}

module.exports = {
  index,
  create,
  update,
  remove,
  indexQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  submit,
};
