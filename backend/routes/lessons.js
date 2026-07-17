const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lessonController');
const { requireRole } = require('../middlewares/role');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @swagger
 * /api/lessons:
 *   get:
 *     summary: Danh sách bài học theo chapter_id, hoặc chi tiết 1 bài học nếu truyền id
 *     tags: [Lessons]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema: { type: integer }
 *       - in: query
 *         name: chapter_id
 *         schema: { type: integer }
 *     responses:
 *       200: { description: OK }
 *       400: { description: Thiếu chapter_id hoặc id. }
 *       404: { description: Không tìm thấy bài học. }
 *   post:
 *     summary: Tạo bài học
 *     tags: [Lessons]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [chapter_id, title]
 *             properties:
 *               chapter_id: { type: integer }
 *               title: { type: string }
 *               description: { type: string }
 *               video_url: { type: string }
 *               document_url: { type: string }
 *     responses:
 *       200: { description: Tạo thành công. }
 *   put:
 *     summary: Cập nhật bài học
 *     tags: [Lessons]
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
 *               video_url: { type: string }
 *               document_url: { type: string }
 *     responses:
 *       200: { description: Cập nhật thành công. }
 *   delete:
 *     summary: Xóa bài học
 *     tags: [Lessons]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Xóa thành công. }
 */
router.get('/', asyncHandler(lessonController.index));
router.post('/', requireRole('admin', 'teacher'), asyncHandler(lessonController.create));
router.put('/', requireRole('admin', 'teacher'), asyncHandler(lessonController.update));
router.delete('/', requireRole('admin', 'teacher'), asyncHandler(lessonController.remove));

module.exports = router;
