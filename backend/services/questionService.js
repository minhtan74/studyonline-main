const Question = require('../models/Question');

async function getByQuiz(quizId) {
  return Question.findAll({
    where: { quiz_id: quizId },
    order: [
      ['order_index', 'ASC'],
      ['id', 'ASC'],
    ],
    raw: true,
  });
}

async function find(id) {
  return Question.findOne({ where: { id }, raw: true });
}

async function countByQuiz(quizId) {
  return Question.count({ where: { quiz_id: quizId } });
}

async function create(quizId, content, optionA, optionB, optionC, optionD, correctAnswer, orderIndex = 0) {
  const row = await Question.create({
    quiz_id: quizId,
    content,
    option_a: optionA,
    option_b: optionB,
    option_c: optionC,
    option_d: optionD,
    correct_answer: correctAnswer,
    order_index: orderIndex,
  });
  return row.id;
}

async function update(id, content, optionA, optionB, optionC, optionD, correctAnswer, orderIndex) {
  await Question.update(
    {
      content,
      option_a: optionA,
      option_b: optionB,
      option_c: optionC,
      option_d: optionD,
      correct_answer: correctAnswer,
      order_index: orderIndex,
    },
    { where: { id } }
  );
  return true;
}

async function remove(id) {
  await Question.destroy({ where: { id } });
  return true;
}

module.exports = { getByQuiz, find, countByQuiz, create, update, remove };
