const swaggerJsdoc = require('swagger-jsdoc');
const appConfig = require('./config/app');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'StudyOnline API',
      version: '1.0.0',
      description:
        'REST API cho hệ thống học trực tuyến StudyOnline (Node.js/Express, chuyển đổi 1:1 từ backend PHP MVC gốc — giữ nguyên toàn bộ endpoint, request/response và nghiệp vụ).',
    },
    servers: [{ url: `http://localhost:${appConfig.port}`, description: 'Local dev server' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        ApiSuccess: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
          },
        },
        ApiError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Đăng nhập / đăng ký / phiên đăng nhập' },
      { name: 'Users', description: 'Quản lý người dùng (Admin/Teacher)' },
      { name: 'Courses', description: 'Khóa học' },
      { name: 'Chapters', description: 'Chương học trong khóa học' },
      { name: 'Lessons', description: 'Bài học trong chương' },
      { name: 'Quizzes', description: 'Bài trắc nghiệm theo khóa học' },
      { name: 'Questions', description: 'Câu hỏi trắc nghiệm (thuộc Quiz — không có bảng Answers riêng, các phương án A/B/C/D là cột của Question)' },
      { name: 'Enrollments', description: 'Đăng ký khóa học' },
      { name: 'Payments', description: 'Thanh toán khóa học' },
      { name: 'Progress', description: 'Tiến độ học tập' },
      { name: 'Upload', description: 'Upload file video / tài liệu / ảnh' },
      { name: 'Reports', description: 'Báo cáo thống kê (Admin)' },
    ],
  },
  apis: ['./routes/*.js'],
};

module.exports = swaggerJsdoc(options);
