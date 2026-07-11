import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar.jsx';

/** Layout cho trang quản lý khóa học generic (courses.html cũ) — không có footer */
export default function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <Outlet />
    </div>
  );
}
