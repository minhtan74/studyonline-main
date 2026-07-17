const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { authenticate } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/role');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @swagger
 * /api/quizzes:
 *   get:
 *     summary: Danh sách quiz (toàn bộ hoặc theo course_id), hoặc chi tiết 1 quiz nếu truyền id
 *     tags: [Quizzes]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema: { type: integer }
 *       - in: query
 *         name: course_id
 *         schema: { type: integer }
 *     responses:
 *       200: { description: OK, mỗi quiz kèm question_count. }
 *       404: { description: Không tìm thấy quiz. }
 *   post:
 *     summary: Tạo quiz
 *     tags: [Quizzes]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [course_id, title]
 *             properties:
 *               course_id: { type: integer }
 *               title: { type: string }
 *               description: { type: string }
 *     responses:
 *       200: { description: Tạo thành công. }
 *   put:
 *     summary: Cập nhật quiz
 *     tags: [Quizzes]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id, course_id, title]
 *             properties:
 *               id: { type: integer }
 *               course_id: { type: integer }
 *               title: { type: string }
 *               description: { type: string }
 *     responses:
 *       200: { description: Cập nhật thành công. }
 *   delete:
 *     summary: Xóa quiz
 *     tags: [Quizzes]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Xóa thành công. }
 */
router.get('/', asyncHandler(quizController.index));
router.post('/', requireRole('admin', 'teacher'), asyncHandler(quizController.create));
router.put('/', requireRole('admin', 'teacher'), asyncHandler(quizController.update));
router.delete('/', requireRole('admin', 'teacher'), asyncHandler(quizController.remove));

/**
 * @swagger
 * /api/quizzes/questions:
 *   get:
 *     summary: Danh sách câu hỏi theo quiz_id, hoặc chi tiết 1 câu hỏi nếu truyền id
 *     tags: [Questions]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema: { type: integer }
 *       - in: query
 *         name: quiz_id
 *         schema: { type: integer }
 *     responses:
 *       200: { description: OK }
 *       400: { description: Thiếu quiz_id hoặc id. }
 *       404: { description: Không tìm thấy câu hỏi. }
 *   post:
 *     summary: Thêm câu hỏi vào quiz
 *     tags: [Questions]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quiz_id, content]
 *             properties:
 *               quiz_id: { type: integer }
 *               content: { type: string }
 *               option_a: { type: string }
 *               option_b: { type: string }
 *               option_c: { type: string }
 *               option_d: { type: string }
 *               correct_answer: { type: string, enum: [A, B, C, D] }
 *               order_index: { type: integer }
 *     responses:
 *       200: { description: Thêm câu hỏi thành công. }
 *   put:
 *     summary: Cập nhật câu hỏi
 *     tags: [Questions]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id, content]
 *             properties:
 *               id: { type: integer }
 *               content: { type: string }
 *               option_a: { type: string }
 *               option_b: { type: string }
 *               option_c: { type: string }
 *               option_d: { type: string }
 *               correct_answer: { type: string, enum: [A, B, C, D] }
 *               order_index: { type: integer }
 *     responses:
 *       200: { description: Cập nhật thành công. }
 *   delete:
 *     summary: Xóa câu hỏi
 *     tags: [Questions]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Xóa thành công. }
 */
router.get('/questions', asyncHandler(quizController.indexQuestions));
router.post('/questions', requireRole('admin', 'teacher'), asyncHandler(quizController.createQuestion));
router.put('/questions', requireRole('admin', 'teacher'), asyncHandler(quizController.updateQuestion));
router.delete('/questions', requireRole('admin', 'teacher'), asyncHandler(quizController.deleteQuestion));

/**
 * @swagger
 * /api/quizzes/submit:
 *   post:
 *     summary: Nộp bài trắc nghiệm và chấm điểm
 *     tags: [Quizzes]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quiz_id, answers]
 *             properties:
 *               quiz_id: { type: integer }
 *               answers:
 *                 type: object
 *                 description: Map question_id → đáp án đã chọn (A/B/C/D)
 *     responses:
 *       200: { description: Kết quả chấm điểm chi tiết. }
 *       404: { description: Quiz không tồn tại hoặc chưa có câu hỏi. }
 */
router.post('/submit', authenticate, asyncHandler(quizController.submit));

module.exports = router;
