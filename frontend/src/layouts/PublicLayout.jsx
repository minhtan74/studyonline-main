import RouteContent from '../components/common/RouteContent.jsx';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';

/** Layout cho Home / Login / Register — navbar và footer dùng chung */
export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <div className="flex-grow flex flex-col">
        <RouteContent><Outlet /></RouteContent>
      </div>
      <Footer />
    </div>
  );
}
