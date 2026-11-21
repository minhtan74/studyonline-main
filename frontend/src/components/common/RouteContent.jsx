import { Component, Suspense } from 'react';
import { useLocation } from 'react-router-dom';

class PageLoadBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidUpdate(previous) {
    if (this.state.failed && previous.resetKey !== this.props.resetKey) {
      this.setState({ failed: false });
    }
  }

  render() {
    if (this.state.failed) return <div className="route-feedback" role="alert">
      <strong>Chưa tải được trang.</strong>
      <p>Kiểm tra kết nối rồi tải lại để tiếp tục.</p>
      <button type="button" onClick={() => window.location.reload()}>Tải lại trang</button>
    </div>;
    return this.props.children;
  }
}

export default function RouteContent({ children }) {
  const location = useLocation();
  return <PageLoadBoundary resetKey={location.pathname + location.search}>
    <Suspense fallback={<div className="route-feedback" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" /> Đang tải trang…
    </div>}>
      {children}
    </Suspense>
  </PageLoadBoundary>;
}
