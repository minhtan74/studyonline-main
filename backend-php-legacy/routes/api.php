<?php
/**
 * api.php — Định nghĩa danh sách các API Route cho hệ thống StudyOnline
 */

use App\Core\Router;
use App\Controllers\AuthController;
use App\Controllers\UserController;
use App\Controllers\CourseController;
use App\Controllers\ChapterController;
use App\Controllers\LessonController;
use App\Controllers\QuizController;
use App\Controllers\EnrollmentController;
use App\Controllers\PaymentController;
use App\Controllers\ProgressController;
use App\Controllers\UploadController;
use App\Controllers\ReportController;

// ── Auth Endpoints ──────────────────────────────────────
Router::post('/api/auth/login',           [AuthController::class, 'login']);
Router::post('/api/auth/register',        [AuthController::class, 'register']);
Router::post('/api/auth/logout',          [AuthController::class, 'logout']);
Router::get('/api/auth/me',              [AuthController::class, 'me']);
Router::post('/api/auth/change-password', [AuthController::class, 'changePassword']);

// ── Users Management Endpoints ──────────────────────────
Router::get('/api/users',            [UserController::class, 'index']);
Router::post('/api/users',           [UserController::class, 'create']);
Router::put('/api/users',            [UserController::class, 'update']);
Router::delete('/api/users',         [UserController::class, 'delete']);

// ── Courses Endpoints ───────────────────────────────────
Router::get('/api/courses',          [CourseController::class, 'index']);
Router::post('/api/courses',         [CourseController::class, 'create']);
Router::put('/api/courses',          [CourseController::class, 'update']);
Router::delete('/api/courses',       [CourseController::class, 'delete']);

// ── Chapters Endpoints ──────────────────────────────────
Router::get('/api/chapters',         [ChapterController::class, 'index']);
Router::post('/api/chapters',        [ChapterController::class, 'create']);
Router::put('/api/chapters',         [ChapterController::class, 'update']);
Router::delete('/api/chapters',      [ChapterController::class, 'delete']);

// ── Lessons Endpoints ───────────────────────────────────
Router::get('/api/lessons',          [LessonController::class, 'index']);
Router::post('/api/lessons',         [LessonController::class, 'create']);
Router::put('/api/lessons',          [LessonController::class, 'update']);
Router::delete('/api/lessons',       [LessonController::class, 'delete']);

// ── Quizzes Endpoints ───────────────────────────────────
Router::get('/api/quizzes',          [QuizController::class, 'index']);
Router::post('/api/quizzes',         [QuizController::class, 'create']);
Router::put('/api/quizzes',          [QuizController::class, 'update']);
Router::delete('/api/quizzes',       [QuizController::class, 'delete']);

// ── Quiz Questions Endpoints ───────────────────────────
Router::get('/api/quizzes/questions',    [QuizController::class, 'indexQuestions']);
Router::post('/api/quizzes/questions',   [QuizController::class, 'createQuestion']);
Router::put('/api/quizzes/questions',    [QuizController::class, 'updateQuestion']);
Router::delete('/api/quizzes/questions', [QuizController::class, 'deleteQuestion']);

// ── Quiz Submit Endpoints ──────────────────────────────
Router::post('/api/quizzes/submit',  [QuizController::class, 'submit']);

// ── Enrollment Endpoints ───────────────────────────────
Router::get('/api/enrollments',      [EnrollmentController::class, 'index']);
Router::post('/api/enrollments',     [EnrollmentController::class, 'create']);
Router::delete('/api/enrollments',   [EnrollmentController::class, 'delete']);

// ── Payment Endpoints ──────────────────────────────────────────────────────────────────────────────────
Router::get('/api/payments',         [PaymentController::class, 'index']);
Router::post('/api/payments',        [PaymentController::class, 'create']);
Router::get('/api/payments/check',   [PaymentController::class, 'check']);

// ── Progress Endpoints ─────────────────────────────────────────────────────────────────────────────────
Router::get('/api/progress',         [ProgressController::class, 'index']);
Router::post('/api/progress',        [ProgressController::class, 'update']);

// ── Upload Endpoints ──────────────────────────────────────────────────────────────────────────────────
Router::post('/api/upload',          [UploadController::class, 'upload']);

// ── Report Endpoints (Admin) ───────────────────────────────────────────────────────────────────────────
Router::get('/api/reports/summary',  [ReportController::class, 'summary']);
