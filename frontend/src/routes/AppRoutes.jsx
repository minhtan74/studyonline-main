import { Routes, Route, Navigate } from 'react-router-dom';

import PublicLayout from '../layouts/PublicLayout.jsx';
import AppLayout from '../layouts/AppLayout.jsx';
import StudentLayout from '../layouts/StudentLayout.jsx';
import AdminLayout from '../layouts/AdminLayout.jsx';
import TeacherLayout from '../layouts/TeacherLayout.jsx';

import ProtectedRoute from './ProtectedRoute.jsx';
import PublicOnlyRoute from './PublicOnlyRoute.jsx';

import Home from '../pages/Home.jsx';
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';
import Courses from '../pages/Courses.jsx';
import Chapters from '../pages/Chapters.jsx';
import Lesson from '../pages/Lesson.jsx';
import Quiz from '../pages/Quiz.jsx';
import QuizShow from '../pages/QuizShow.jsx';

import StudentDashboard from '../pages/student/Dashboard.jsx';
import StudentCourses from '../pages/student/Courses.jsx';
import StudentMyCourses from '../pages/student/MyCourses.jsx';
import StudentProfile from '../pages/student/Profile.jsx';
import StudentProgress from '../pages/student/Progress.jsx';
import StudentQuizResult from '../pages/student/QuizResult.jsx';

import AdminOverview from '../pages/admin/Overview.jsx';
import AdminUsers from '../pages/admin/Users.jsx';
import AdminCourses from '../pages/admin/Courses.jsx';
import AdminStats from '../pages/admin/Stats.jsx';
import AdminReports from '../pages/admin/Reports.jsx';
import AdminSettings from '../pages/admin/Settings.jsx';

import TeacherOverview from '../pages/teacher/Overview.jsx';
import TeacherCourses from '../pages/teacher/Courses.jsx';
import TeacherChapters from '../pages/teacher/Chapters.jsx';
import TeacherLessons from '../pages/teacher/Lessons.jsx';
import TeacherQuizzes from '../pages/teacher/Quizzes.jsx';
import TeacherQuizQuestions from '../pages/teacher/QuizQuestions.jsx';
import TeacherStudents from '../pages/teacher/Students.jsx';
import TeacherStats from '../pages/teacher/Stats.jsx';
import TeacherProfile from '../pages/teacher/Profile.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
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

      <Route element={<AppLayout />}>
        <Route
          path="/courses"
          element={
            <ProtectedRoute>
              <Courses />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/chapters" element={<Chapters />} />
        <Route path="/lesson" element={<Lesson />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/quiz-show" element={<QuizShow />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/courses" element={<StudentCourses />} />
        <Route path="/student/my-courses" element={<StudentMyCourses />} />
        <Route path="/student/profile" element={<StudentProfile />} />
        <Route path="/student/progress" element={<StudentProgress />} />
        <Route path="/student/quiz-result" element={<StudentQuizResult />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['admin']} wrongRoleRedirect="/login" alertOnWrongRole="Bạn không có quyền truy cập trang này.">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminOverview />} />
        <Route path="users" element={<AdminUsers roleFilter={null} />} />
        <Route path="teachers" element={<AdminUsers roleFilter="teacher" />} />
        <Route path="students" element={<AdminUsers roleFilter="student" />} />
        <Route path="courses" element={<AdminCourses />} />
        <Route path="stats" element={<AdminStats />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

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
        <Route path="students" element={<TeacherStudents />} />
        <Route path="stats" element={<TeacherStats />} />
        <Route path="profile" element={<TeacherProfile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
