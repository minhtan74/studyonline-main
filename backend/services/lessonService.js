const Lesson = require('../models/Lesson');

async function getByChapter(chapterId) {
  return Lesson.findAll({ where: { chapter_id: chapterId }, order: [['id', 'ASC']], raw: true });
}

async function find(id) {
  return Lesson.findOne({ where: { id }, raw: true });
}

async function create(chapterId, title, description, videoUrl = '', documentUrl = '') {
  const row = await Lesson.create({
    chapter_id: chapterId,
    title,
    description,
    video_url: videoUrl,
    document_url: documentUrl,
  });
  return row.id;
}

async function update(id, title, description, videoUrl = '', documentUrl = '') {
  await Lesson.update(
    { title, description, video_url: videoUrl, document_url: documentUrl },
    { where: { id } }
  );
  return true;
}

async function remove(id) {
  await Lesson.destroy({ where: { id } });
  return true;
}

module.exports = { getByChapter, find, create, update, remove };
