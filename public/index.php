<?php
session_start();

require_once __DIR__ . "/../app/controllers/HomeController.php";
require_once __DIR__ . "/../app/controllers/AuthController.php";
require_once __DIR__ . "/../app/controllers/DashboardController.php";
require_once __DIR__ . "/../app/controllers/CourseController.php";
require_once __DIR__ . "/../app/controllers/ChapterController.php";
require_once __DIR__ . "/../app/controllers/LessonController.php";
require_once __DIR__ . "/../app/controllers/QuizController.php";
$page = $_GET['page'] ?? 'home';

switch ($page) {
    case 'quiz':
        $quizController = new QuizController();
        $quizController->index();
        break;
    case 'quiz-show':
        $quizController = new QuizController();
        $quizController->show();
        break;
    case 'quiz-submit':
        $quizController = new QuizController();
        $quizController->submit();
        break;
    case 'quiz-result':
        $quizController = new QuizController();
        $quizController->result();
        break;
    case 'create-quiz':
        $quizController = new QuizController();
        $quizController->create();
        break;
    case 'store-quiz':
        $quizController = new QuizController();
        $quizController->store();
        break;
    case 'edit-quiz':
        $quizController = new QuizController();
        $quizController->edit();
        break;
    case 'update-quiz':
        $quizController = new QuizController();
        $quizController->update();
        break;
    case 'delete-quiz':
        $quizController = new QuizController();
        $quizController->delete();
        break;
    case 'quiz-questions':
        $quizController = new QuizController();
        $quizController->questions();
        break;
    case 'create-question':
        $quizController = new QuizController();
        $quizController->createQuestion();
        break;
    case 'store-question':
        $quizController = new QuizController();
        $quizController->storeQuestion();
        break;
    case 'edit-question':
        $quizController = new QuizController();
        $quizController->editQuestion();
        break;
    case 'update-question':
        $quizController = new QuizController();
        $quizController->updateQuestion();
        break;
    case 'delete-question':
        $quizController = new QuizController();
        $quizController->deleteQuestion();
        break;
    case 'lessons':
        $lessonController = new LessonController();
        $lessonController->index();
        break;
    case 'show-lesson':
        $lessonController = new LessonController();
        $lessonController->show();
        break;
    case 'create-lesson':
        $lessonController = new LessonController();
        $lessonController->create();
        break;
    case 'store-lesson':
        $lessonController = new LessonController();
        $lessonController->store();
        break;
    case 'edit-lesson':
        $lessonController = new LessonController();
        $lessonController->edit();
        break;
    case 'update-lesson':
        $lessonController = new LessonController();
        $lessonController->edit();
        break;
    case 'delete-lesson':
        $lessonController = new LessonController();
        $lessonController->delete();
        break;
    case 'chapters':
        $chapterController = new ChapterController();
        $chapterController->index();
        break;
    case 'create-chapter':
        $chapterController = new ChapterController();
        $chapterController->create();
        break;
    case 'add-chapter':
        $chapterController = new ChapterController();
        $chapterController->store();
        break;
    case 'edit-chapter':
        $chapterController = new ChapterController();
        $chapterController->edit();
        break;
    case 'update-chapter':
        $chapterController = new ChapterController();
        $chapterController->update();
        break;
    case 'delete-chapter':
        $chapterController = new ChapterController();
        $chapterController->destroy();
        break;
    case 'courses':
        $courseController = new CourseController();
        $courseController->index();
        break;
    case 'create-course':
        $courseController = new CourseController();
        $courseController->create();
        break;
    case 'add-course':
        $courseController = new CourseController();
        $courseController->store();
        break;
    case 'edit-course':
        $courseController = new CourseController();
        $courseController->edit();
        break;
    case 'update-course':
        $courseController = new CourseController();
        $courseController->update();
        break;
    case 'delete-course':
        $courseController = new CourseController();
        $courseController->delete();
        break;
    case 'dashboard':
        if (!isset($_SESSION['user'])) {
            header("Location: index.php?page=login");
            exit();
        }
        $dashboardController = new DashboardController();
        $dashboardController->index();
        break;
    case 'login':
        $authController = new AuthController();
        $authController->login();
        break;
    case 'do-login':
        $authController = new AuthController();
        $authController->doLogin();
        break;
    case 'register':
        $authController = new AuthController();
        $authController->register();
        break;
    case 'do-register':
        $authController = new AuthController();
        $authController->doRegister();
        break;
    case 'logout':
        $authController = new AuthController();
        $authController->logout();
        break;
    default:
        $controller = new HomeController();
        $controller->index();
        break;
}