const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { requireRole } = require('../middlewares/role');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Danh sách khóa học, hoặc chi tiết 1 khóa học nếu truyền ?id=
 *     tags: [Courses]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema: { type: integer }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Không tìm thấy khóa học. }
 *   post:
 *     summary: Tạo khóa học (teacher_id = người dùng đang đăng nhập)
 *     tags: [Courses]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               thumbnail: { type: string }
 *     responses:
 *       200: { description: Tạo thành công. }
 *   put:
 *     summary: Cập nhật khóa học
 *     tags: [Courses]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id, title]
 *             properties:
 *               id: { type: integer }
 *               title: { type: string }
 *               description: { type: string }
 *               thumbnail: { type: string }
 *     responses:
 *       200: { description: Cập nhật thành công. }
 *   delete:
 *     summary: Xóa khóa học
 *     tags: [Courses]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Xóa thành công. }
 */
router.get('/', asyncHandler(courseController.index));
router.post('/', requireRole('admin', 'teacher'), asyncHandler(courseController.create));
router.put('/', requireRole('admin', 'teacher'), asyncHandler(courseController.update));
router.delete('/', requireRole('admin', 'teacher'), asyncHandler(courseController.remove));

module.exports = router;
