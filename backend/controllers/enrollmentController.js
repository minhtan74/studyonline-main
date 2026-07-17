const { success, error } = require('../utils/response');
const enrollmentService = require('../services/enrollmentService');

async function index(req, res) {
  const user = req.user;
  const q = req.query;

  if (q.course_id) {
    const enrolled = await enrollmentService.isEnrolled(user.id, parseInt(q.course_id, 10));
    return success(res, { enrolled });
  }
  if (q.ids_only) {
    const ids = await enrollmentService.getEnrolledCourseIds(user.id);
    return success(res, { data: ids });
  }

  let data;
  if (user.role === 'admin') {
    data = await enrollmentService.getAll();
  } else if (user.role === 'teacher') {
    data = await enrollmentService.getByTeacher(user.id);
  } else {
    data = await enrollmentService.getByUser(user.id);
  }
  return success(res, { data });
}

async function create(req, res) {
  const user = req.user;
  const input = req.body || {};
  const courseId = parseInt(input.course_id ?? 0, 10);

  if (!courseId) {
    return error(res, 'Thiếu course_id.');
  }

  if (await enrollmentService.isEnrolled(user.id, courseId)) {
    return error(res, 'Bạn đã đăng ký khóa học này rồi.', 409);
  }

  const ok = await enrollmentService.enroll(user.id, courseId);
  if (ok) {
    return success(res, [], 'Đăng ký khóa học thành công!');
  }
  return error(res, 'Đăng ký thất bại, vui lòng thử lại.');
}

async function remove(req, res) {
  const user = req.user;
  const courseId = parseInt(req.query.course_id ?? 0, 10);
  if (!courseId) {
    return error(res, 'Thiếu course_id.');
  }
  await enrollmentService.unenroll(user.id, courseId);
  return success(res, [], 'Đã hủy đăng ký.');
}

module.exports = { index, create, remove };
