import { lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Layout khung trang theo từng khu vực (công khai / học viên / admin / giảng viên)
import PublicLayout from '../layouts/PublicLayout.jsx';
import StudentLayout from '../layouts/StudentLayout.jsx';
import AdminLayout from '../layouts/AdminLayout.jsx';
import TeacherLayout from '../layouts/TeacherLayout.jsx';

// Các "cổng" kiểm tra đăng nhập và vai trò trước khi vào trang
import ProtectedRoute from './ProtectedRoute.jsx';
import PublicOnlyRoute from './PublicOnlyRoute.jsx';
import CoursesRedirect from './CoursesRedirect.jsx';

// Các trang công khai và trang học tập dùng chung
import Home from '../pages/Home.jsx';
const Help = lazy(() => import('../pages/Help.jsx'));
const Login = lazy(() => import('../pages/Login.jsx'));
const Register = lazy(() => import('../pages/Register.jsx'));
const PasswordRecovery = lazy(() => import('../pages/PasswordRecovery.jsx'));
const Chapters = lazy(() => import('../pages/Chapters.jsx'));
const Lesson = lazy(() => import('../pages/Lesson.jsx'));
const AiSource = lazy(() => import('../pages/AiSource.jsx'));
const Quiz = lazy(() => import('../pages/Quiz.jsx'));
const QuizShow = lazy(() => import('../pages/QuizShow.jsx'));
const RecommendationPreview = lazy(() => import('../pages/RecommendationPreview.jsx'));

// Trang của học viên
const StudentDashboard = lazy(() => import('../pages/student/Dashboard.jsx'));
const StudentCourses = lazy(() => import('../pages/student/Courses.jsx'));
const StudentMyCourses = lazy(() => import('../pages/student/MyCourses.jsx'));
const StudentProfile = lazy(() => import('../pages/student/Profile.jsx'));
const StudentProgress = lazy(() => import('../pages/student/Progress.jsx'));
const StudentRecommendations = lazy(() => import('../pages/student/Recommendations.jsx'));
const StudentQuizResult = lazy(() => import('../pages/student/QuizResult.jsx'));
const StudentAiTutor = lazy(() => import('../pages/student/AiTutor.jsx'));
const StudentPaymentResult = lazy(() => import('../pages/student/PaymentResult.jsx'));

// Trang của admin
const AdminOverview = lazy(() => import('../pages/admin/Overview.jsx'));
const AdminUsers = lazy(() => import('../pages/admin/Users.jsx'));
const AdminCourses = lazy(() => import('../pages/admin/Courses.jsx'));
const AdminReports = lazy(() => import('../pages/admin/Reports.jsx'));
const AdminPayments = lazy(() => import('../pages/admin/Payments.jsx'));

// Trang của giảng viên
const TeacherOverview = lazy(() => import('../pages/teacher/Overview.jsx'));
const TeacherCourses = lazy(() => import('../pages/teacher/Courses.jsx'));
const TeacherChapters = lazy(() => import('../pages/teacher/Chapters.jsx'));
const TeacherLessons = lazy(() => import('../pages/teacher/Lessons.jsx'));
const TeacherQuizzes = lazy(() => import('../pages/teacher/Quizzes.jsx'));
const TeacherQuizQuestions = lazy(() => import('../pages/teacher/QuizQuestions.jsx'));
const TeacherProfile = lazy(() => import('../pages/teacher/Profile.jsx'));
const TeacherDocuments = lazy(() => import('../pages/teacher/Documents.jsx'));

// Bảng định tuyến: đường dẫn URL -> trang tương ứng
// Đường dẫn cũ /teacher/ai-quiz?... -> tab AI của trang Quiz, giữ nguyên các tham số chọn sẵn khóa / chương / bài
function AiQuizRedirect() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  params.set('tab', 'ai');
  return <Navigate to={`/teacher/quizzes?${params.toString()}`} replace />;
}

// Keep old teacher report/statistics links working without a second page.
function TeacherDashboardRedirect() {
  const {search, hash} = useLocation();
  return <Navigate to={{pathname:'/teacher',search,hash}} replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      {import.meta.env.DEV && <Route path="/preview/ai-recommendations" element={<RecommendationPreview />} />}
      {/* Khu vực công khai: trang chủ; /login và /register chỉ dành cho người chưa đăng nhập */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/help" element={<Help />} />
        <Route path="/forgot-password" element={<PasswordRecovery />} />
        <Route path="/reset-password" element={<PasswordRecovery reset />} />
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <Register />
            </PublicOnlyRoute>
          }
        />
      </Route>

      {/* /courses -> chuyển tới trang khóa học đúng với vai trò */}
      <Route path="/courses" element={<CoursesRedirect />} />

      <Route
        element={
          <ProtectedRoute>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        {/* Khu vực cần đăng nhập (mọi vai trò): học bài, làm quiz và các trang của học viên */}
        <Route path="/chapters" element={<Chapters />} />
        <Route path="/lesson" element={<Lesson />} />
        <Route path="/ai-source" element={<AiSource />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/quiz-show" element={<QuizShow />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/courses" element={<StudentCourses />} />
        <Route path="/student/my-courses" element={<StudentMyCourses />} />
        <Route path="/student/profile" element={<StudentProfile />} />
        <Route path="/student/progress" element={<StudentProgress />} />
        <Route path="/student/recommendations" element={<StudentRecommendations />} />
        <Route path="/student/quiz-result" element={<StudentQuizResult />} />
        <Route path="/student/quiz-history" element={<Navigate to="/quiz" replace />} />
        <Route path="/student/ai-tutor" element={<StudentAiTutor />} />
        {/* VNPay chuyển về đây (qua backend) sau khi thanh toán */}
        <Route path="/student/payment-result" element={<StudentPaymentResult />} />
      </Route>

      {/* Khu vực admin: chỉ vai trò admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['admin']} wrongRoleRedirect="/login" alertOnWrongRole="Bạn không có quyền truy cập trang này.">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminOverview />} />
        {/* Quản lý User gồm 2 nhánh con: Teacher và Student */}
        <Route path="users" element={<AdminUsers roleFilter={null} />} />
        <Route path="users/teachers" element={<AdminUsers roleFilter="teacher" />} />
        <Route path="users/students" element={<AdminUsers roleFilter="student" />} />
        {/* Đường dẫn cũ -> chuyển sang đường dẫn mới nằm trong /admin/users */}
        <Route path="teachers" element={<Navigate to="/admin/users/teachers" replace />} />
        <Route path="students" element={<Navigate to="/admin/users/students" replace />} />
        <Route path="courses" element={<AdminCourses />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="reports" element={<AdminReports />} />
      </Route>

      {/* Khu vực giảng viên: giảng viên (và admin) */}
      <Route
        path="/teacher"
        element={
          <ProtectedRoute
            roles={['teacher', 'admin']}
            wrongRoleRedirect="/login"
            alertOnWrongRole="Bạn không có quyền truy cập trang này."
          >
            <TeacherLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<TeacherOverview />} />
        <Route path="courses" element={<TeacherCourses />} />
        <Route path="chapters" element={<TeacherChapters />} />
        <Route path="lessons" element={<TeacherLessons />} />
        <Route path="quizzes" element={<TeacherQuizzes />} />
        <Route path="quizzes/:quizId/questions" element={<TeacherQuizQuestions />} />
        <Route path="reports" element={<TeacherDashboardRedirect />} />
        {/* Báo cáo, Học viên và Thống kê cũ đã gộp vào Dashboard */}
        <Route path="students" element={<TeacherDashboardRedirect />} />
        <Route path="stats" element={<TeacherDashboardRedirect />} />
        <Route path="profile" element={<TeacherProfile />} />
        <Route path="documents" element={<TeacherDocuments />} />
        <Route path="topics" element={<Navigate to="/teacher/quizzes" replace />} />
        {/* AI Quiz Generator đã gộp vào trang Quiz (tab "Tạo bằng AI"); giữ đường dẫn cũ để chuyển hướng */}
        <Route path="ai-quiz" element={<AiQuizRedirect />} />
      </Route>

      {/* Đường dẫn không tồn tại -> về trang chủ */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
