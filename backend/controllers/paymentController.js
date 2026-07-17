const { success, error } = require('../utils/response');
const paymentService = require('../services/paymentService');
const enrollmentService = require('../services/enrollmentService');
const courseService = require('../services/courseService');

const VALID_METHODS = ['card', 'bank_transfer', 'momo', 'zalopay'];

function generateTransactionRef() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const y = pad(now.getFullYear() % 100);
  const m = pad(now.getMonth() + 1);
  const d = pad(now.getDate());
  const H = pad(now.getHours());
  const i = pad(now.getMinutes());
  const s = pad(now.getSeconds());
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `SO${y}${m}${d}${H}${i}${s}${rand}`.toUpperCase();
}

async function index(req, res) {
  const user = req.user;
  let data;
  if (user.role === 'admin') {
    data = await paymentService.getAll();
  } else if (user.role === 'teacher') {
    data = await paymentService.getByTeacher(user.id);
  } else {
    data = await paymentService.getByUser(user.id);
  }
  return success(res, { data });
}

async function create(req, res) {
  const user = req.user;
  const input = req.body || {};
  const courseId = parseInt(input.course_id ?? 0, 10);
  const method = String(input.method ?? 'card').trim();

  if (!courseId) {
    return error(res, 'Thiếu course_id.');
  }
  if (!VALID_METHODS.includes(method)) {
    return error(res, 'Phương thức không hợp lệ.');
  }

  const course = await courseService.find(courseId);
  if (!course) {
    return error(res, 'Khóa học không tồn tại.', 404);
  }

  if (await enrollmentService.isEnrolled(user.id, courseId)) {
    return error(res, 'Bạn đã đăng ký khóa học này rồi.', 409);
  }

  const amount = parseFloat(course.price ?? 0) || 0;

  // Khóa miễn phí → enroll thẳng
  if (amount <= 0) {
    await enrollmentService.enroll(user.id, courseId);
    return success(res, { enrolled: true, payment_required: false }, 'Đăng ký thành công!');
  }

  // Tạo giao dịch
  const ref = generateTransactionRef();
  let paymentId;
  try {
    paymentId = await paymentService.create(user.id, courseId, amount, method, ref);
  } catch (e) {
    paymentId = null;
  }

  if (!paymentId) {
    return error(res, 'Không thể tạo giao dịch.');
  }

  await paymentService.complete(paymentId, ref);
  await enrollmentService.enroll(user.id, courseId);

  return success(
    res,
    {
      payment_id: parseInt(paymentId, 10),
      transaction_ref: ref,
      amount,
      method,
      enrolled: true,
      payment_required: true,
    },
    'Thanh toán thành công! Bạn đã được đăng ký vào khóa học.'
  );
}

async function check(req, res) {
  const user = req.user;
  const courseId = parseInt(req.query.course_id ?? 0, 10);
  if (!courseId) {
    return error(res, 'Thiếu course_id.');
  }

  const hasPaid = await paymentService.hasPaid(user.id, courseId);
  const enrolled = await enrollmentService.isEnrolled(user.id, courseId);
  return success(res, { has_paid: hasPaid, enrolled });
}

module.exports = { index, create, check };
