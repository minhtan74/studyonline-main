const Chapter = require('../models/Chapter');

async function getByCourse(courseId) {
  return Chapter.findAll({ where: { course_id: courseId }, order: [['id', 'ASC']], raw: true });
}

async function find(id) {
  return Chapter.findOne({ where: { id }, raw: true });
}

async function create(courseId, chapterName) {
  const row = await Chapter.create({ course_id: courseId, chapter_name: chapterName });
  return row.id;
}

async function update(id, chapterName) {
  await Chapter.update({ chapter_name: chapterName }, { where: { id } });
  return true;
}

async function remove(id) {
  await Chapter.destroy({ where: { id } });
  return true;
}

module.exports = { getByCourse, find, create, update, remove };
