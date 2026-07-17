import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Chart, registerables } from 'chart.js';
import { reportService } from '../../services/reportService';

Chart.register(...registerables);

/* ─── Helpers ─────────────────────────────────────────────────────── */
function fmt(num) {
  return Number(num || 0).toLocaleString('vi-VN');
}
function fmtMoney(num) {
  return Number(num || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });
}
function fmtDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function statusBadge(status) {
  const map = {
    completed: { label: 'Thành công', cls: 'badge-success' },
    pending:   { label: 'Đang xử lý', cls: 'badge-warning' },
    failed:    { label: 'Thất bại',   cls: 'badge-danger' },
  };
  const s = map[status] || { label: status, cls: 'badge-primary' };
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}
function methodLabel(m) {
  const map = { card: '💳 Thẻ', bank_transfer: '🏦 Chuyển khoản', momo: '🟣 MoMo', zalopay: '🔵 ZaloPay' };
  return map[m] || m;
}
function ProgressBar({ pct }) {
  const p = Math.min(100, Math.max(0, Math.round(pct || 0)));
  const color = p >= 75 ? 'var(--success)' : p >= 40 ? 'var(--warning)' : 'var(--danger)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: 'var(--surface-2)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${p}%`, background: color, borderRadius: 99, transition: 'width .4s' }} />
      </div>
      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', minWidth: 32, textAlign: 'right' }}>{p}%</span>
    </div>
  );
}

/* ─── Biểu đồ doanh thu (thích ứng theo range) ─────────────────── */
function RevenueLineChart({ data }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Nếu không có dữ liệu thực (tất cả = 0), vẫn vẽ nhưng hiển thị trục
    const hasData = data?.length > 0;
    if (chartRef.current) chartRef.current.destroy();

    if (!hasData) return;

    // Chọn loại biểu đồ: nhiều điểm → line mượt; ít điểm → bar
    const useLineChart = data.length > 10;
    const primaryColor = '#2563eb';

    chartRef.current = new Chart(canvasRef.current, {
      type: useLineChart ? 'line' : 'bar',
      data: {
        labels: data.map((d) => d.label),
        datasets: [
          {
            label: 'Doanh thu (VNĐ)',
            data:  data.map((d) => d.revenue),
            backgroundColor: useLineChart ? 'rgba(37,99,235,0.10)' : 'rgba(37,99,235,0.18)',
            borderColor:     primaryColor,
            borderWidth: useLineChart ? 2 : 2,
            borderRadius: useLineChart ? 0 : 6,
            fill: useLineChart,
            tension: 0.35,
            pointRadius: data.length > 20 ? 2 : 4,
            pointHoverRadius: 6,
            pointBackgroundColor: primaryColor,
            hoverBackgroundColor: 'rgba(37,99,235,0.35)',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ' Doanh thu: ' + fmt(ctx.parsed.y) + ' ₫',
              afterLabel: (ctx) => {
                const orders = data[ctx.dataIndex]?.orders;
                return orders != null ? ` Số đơn: ${orders}` : '';
              },
            },
          },
        },
        scales: {
          y: {
            ticks: { callback: (v) => fmt(v) + ' ₫', font: { size: 11 } },
            grid: { color: 'rgba(0,0,0,.05)' },
            beginAtZero: true,
          },
          x: {
            grid: { display: false },
            ticks: {
              // Khi quá nhiều điểm, chỉ hiện 1 số nhãn để tránh chật
              maxTicksLimit: data.length > 20 ? 8 : data.length > 10 ? 12 : data.length,
              maxRotation: 0,
              font: { size: 10 },
            },
          },
        },
      },
    });
    return () => { chartRef.current?.destroy(); };
  }, [data]);

  // Hiện placeholder khi chưa có dữ liệu
  if (!data?.length) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '0.5rem' }}>
        <span style={{ fontSize: '2rem' }}>📊</span>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Chưa có dữ liệu trong khoảng thời gian này</p>
      </div>
    );
  }

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
}

/* ─── Biểu đồ Doughnut phương thức ──────────────────────────────── */
function MethodDoughnut({ data }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);
  const COLORS = ['#2563eb', '#8b5cf6', '#ec4899', '#06b6d4', '#f59e0b'];

  useEffect(() => {
    if (!data?.length || !canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new Chart(canvasRef.current, {
      type: 'doughnut',
      data: {
        labels: data.map((d) => methodLabel(d.method)),
        datasets: [{
          data:            data.map((d) => d.revenue),
          backgroundColor: COLORS.slice(0, data.length),
          borderWidth:     2,
          borderColor:     '#fff',
          hoverOffset:     8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: { position: 'bottom', labels: { padding: 16, font: { size: 12 } } },
          tooltip: { callbacks: { label: (ctx) => ' ' + fmt(ctx.parsed) + ' ₫' } },
        },
      },
    });
    return () => { chartRef.current?.destroy(); };
  }, [data]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
}

/* ─── Component chính ────────────────────────────────────────────── */
export default function AdminReports() {
  const [loading, setLoading] = useState(true);
  const [report,  setReport]  = useState(null);
  const [error,   setError]   = useState(null);
  const [activeTab, setActiveTab] = useState('revenue'); // 'revenue' | 'students' | 'courses'

  // Bộ lọc biểu đồ doanh thu
  const [chartRange,   setChartRange]   = useState('7d');
  const [chartData,    setChartData]    = useState([]);
  const [chartLoading, setChartLoading] = useState(false);

  const RANGES = [
    { key: 'today', label: 'Hôm nay' },
    { key: '7d',    label: '7 ngày'  },
    { key: '30d',   label: '30 ngày' },
    { key: '1y',    label: '1 năm'  },
  ];
  const RANGE_TITLES = {
    today: 'Doanh thu hôm nay (theo giờ)',
    '7d':  'Doanh thu 7 ngày gần nhất',
    '30d': 'Doanh thu 30 ngày gần nhất',
    '1y':  'Doanh thu 12 tháng gần nhất',
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await reportService.getSummary(chartRange);
        if (res?.data?.success) {
          setReport(res.data.data);
          setChartData(res.data.data.revenue_weekly || []);
        } else setError('Không thể tải dữ liệu báo cáo.');
      } catch {
        setError('Lỗi kết nối đến server.');
      } finally {
        setLoading(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Chỉ reload phần biểu đồ khi đổi range (giữ nguyên KPI và các dữ liệu khác)
  async function handleRangeChange(range) {
    setChartRange(range);
    setChartLoading(true);
    try {
      const res = await reportService.getSummary(range);
      if (res?.data?.success) setChartData(res.data.data.revenue_weekly || []);
    } finally {
      setChartLoading(false);
    }
  }

  const ov = report?.overview || {};

  /* KPI cards */
  const kpis = [
    {
      icon: '💰', label: 'Tổng doanh thu', value: fmtMoney(ov.total_revenue),
      sub: `${fmt(ov.total_orders)} đơn thành công`, color: 'rgba(16,185,129,.12)', iconColor: 'var(--success)',
    },
    {
      icon: '🎒', label: 'Tổng học viên', value: fmt(ov.total_students),
      sub: `+${fmt(ov.new_students_30d)} trong 30 ngày`, color: 'rgba(37,99,235,.1)', iconColor: 'var(--primary)',
    },
    {
      icon: '📊', label: 'Tỷ lệ hoàn thành TB', value: `${ov.avg_completion_pct ?? '—'}%`,
      sub: 'Trên tất cả khóa học', color: 'rgba(139,92,246,.1)', iconColor: 'var(--accent)',
    },
    {
      icon: '⏳', label: 'Đơn đang xử lý', value: fmt(ov.pending_orders),
      sub: `${fmt(ov.failed_orders)} đơn thất bại`, color: 'rgba(245,158,11,.1)', iconColor: 'var(--warning)',
    },
  ];

  return (
    <>
      {/* ── Page Header ── */}
      <div className="page-header">
        <div className="breadcrumb">
          <Link to="/admin">Admin</Link> / <span>Báo cáo</span>
        </div>
        <h1 className="page-title">📄 Báo cáo &amp; Thống kê</h1>
        <p className="page-subtitle">Phân tích doanh thu, học viên và hiệu suất khóa học toàn hệ thống.</p>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '5rem 0' }}>
          <div className="spinner" style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--primary)' }} />
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Đang tải dữ liệu báo cáo...</p>
        </div>
      )}

      {!loading && error && (
        <div className="alert alert-danger">{error}</div>
      )}

      {!loading && report && (
        <>
          {/* ── KPI Cards ── */}
          <div className="stats-grid" style={{ marginBottom: '2rem' }}>
            {kpis.map((k) => (
              <div key={k.label} className="stat-card">
                <div className="stat-icon-wrap" style={{ background: k.color, color: k.iconColor, fontSize: '1.4rem' }}>
                  {k.icon}
                </div>
                <div>
                  <div className="stat-label">{k.label}</div>
                  <div className="stat-value" style={{ fontSize: '1.4rem' }}>{k.value}</div>
                  <span className="stat-trend" style={{ color: 'var(--text-muted)' }}>{k.sub}</span>
                </div>
              </div>
            ))}
          </div>

          {/* ── Biểu đồ doanh thu 7 ngày ── */}
          <div className="grid grid-2" style={{ marginBottom: '2rem', alignItems: 'start' }}>
            {/* Bar chart doanh thu */}
            <div className="card">
              <div className="card-header" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1rem', flex: 1, minWidth: 160 }}>📈 {RANGE_TITLES[chartRange]}</h3>
                {/* Bộ lọc khoảng thời gian */}
                <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
                  {RANGES.map((r) => (
                    <button
                      key={r.key}
                      onClick={() => handleRangeChange(r.key)}
                      disabled={chartLoading}
                      style={{
                        padding: '0.3rem 0.75rem',
                        fontSize: '0.78rem',
                        fontWeight: chartRange === r.key ? 700 : 500,
                        borderRadius: 99,
                        border: chartRange === r.key ? '2px solid var(--primary)' : '1px solid var(--border)',
                        background: chartRange === r.key ? 'var(--primary)' : 'transparent',
                        color: chartRange === r.key ? '#fff' : 'var(--text-muted)',
                        cursor: chartLoading ? 'wait' : 'pointer',
                        transition: 'all 0.18s',
                        opacity: chartLoading && chartRange !== r.key ? 0.5 : 1,
                      }}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="card-body" style={{ height: 220, position: 'relative' }}>
                {chartLoading && (
                  <div style={{
                    position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', background: 'rgba(0,0,0,.04)', borderRadius: 8, zIndex: 1,
                  }}>
                    <div className="spinner" style={{ width: 28, height: 28, border: '3px solid var(--border)', borderTopColor: 'var(--primary)' }} />
                  </div>
                )}
                <RevenueLineChart data={chartData} />
              </div>
            </div>

            {/* Doughnut phương thức */}
            <div className="card">
              <div className="card-header">
                <h3 style={{ fontSize: '1rem' }}>💳 Doanh thu theo phương thức</h3>
              </div>
              <div className="card-body" style={{ height: 220 }}>
                {report.revenue_by_method?.length > 0 ? (
                  <MethodDoughnut data={report.revenue_by_method} />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '0.5rem' }}>
                    <span style={{ fontSize: '2.5rem' }}>💳</span>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Chưa có giao dịch hoàn thành</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Tabs bảng chi tiết ── */}
          <div className="card">
            {/* Tab bar */}
            <div className="card-header" style={{ padding: '0 1.5rem', borderBottom: '1px solid var(--border)', gap: 0 }}>
              {[
                { key: 'revenue',  label: '💰 Giao dịch' },
                { key: 'students', label: '🎒 Đăng ký học' },
                { key: 'courses',  label: '📚 Top khóa học' },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  style={{
                    padding: '1rem 1.25rem',
                    background: 'none',
                    border: 'none',
                    borderBottom: activeTab === t.key ? '2px solid var(--primary)' : '2px solid transparent',
                    color: activeTab === t.key ? 'var(--primary)' : 'var(--text-muted)',
                    fontWeight: activeTab === t.key ? 700 : 500,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap',
                    marginBottom: -1,
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* ── Tab: Giao dịch ── */}
            {activeTab === 'revenue' && (
              <div className="card-body" style={{ padding: 0 }}>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Học viên</th>
                        <th>Khóa học</th>
                        <th>Phương thức</th>
                        <th>Số tiền</th>
                        <th>Trạng thái</th>
                        <th>Ngày tạo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.recent_payments?.length === 0 && (
                        <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Chưa có giao dịch nào.</td></tr>
                      )}
                      {report.recent_payments?.map((p) => (
                        <tr key={p.id}>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>#{p.id}</td>
                          <td><strong>{p.user_name}</strong></td>
                          <td style={{ maxWidth: 200 }}>
                            <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {p.course_title}
                            </span>
                          </td>
                          <td>{methodLabel(p.method)}</td>
                          <td style={{ fontWeight: 700, color: 'var(--success)' }}>{fmtMoney(p.amount)}</td>
                          <td>{statusBadge(p.status)}</td>
                          <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{fmtDate(p.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── Tab: Đăng ký học ── */}
            {activeTab === 'students' && (
              <div className="card-body" style={{ padding: 0 }}>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Học viên</th>
                        <th>Email</th>
                        <th>Khóa học</th>
                        <th>Tiến độ</th>
                        <th>Ngày đăng ký</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.recent_enrollments?.length === 0 && (
                        <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Chưa có đăng ký nào.</td></tr>
                      )}
                      {report.recent_enrollments?.map((e) => {
                        const pct = e.total_lessons > 0 ? (e.done_lessons / e.total_lessons) * 100 : 0;
                        return (
                          <tr key={e.id}>
                            <td><strong>{e.user_name}</strong></td>
                            <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{e.email}</td>
                            <td style={{ maxWidth: 200 }}>
                              <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {e.course_title}
                              </span>
                            </td>
                            <td style={{ minWidth: 140 }}>
                              <ProgressBar pct={pct} />
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                {e.done_lessons}/{e.total_lessons} bài
                              </span>
                            </td>
                            <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{fmtDate(e.enroll_date)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── Tab: Top khóa học ── */}
            {activeTab === 'courses' && (
              <div className="card-body" style={{ padding: 0 }}>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Khóa học</th>
                        <th>Giảng viên</th>
                        <th>Học viên</th>
                        <th>Doanh thu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.top_courses?.length === 0 && (
                        <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Chưa có dữ liệu.</td></tr>
                      )}
                      {report.top_courses?.map((c, i) => (
                        <tr key={c.id}>
                          <td>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              width: 26, height: 26, borderRadius: '50%', fontSize: '0.75rem', fontWeight: 800,
                              background: i === 0 ? '#fef3c7' : i === 1 ? '#f3f4f6' : i === 2 ? '#fde8d8' : 'var(--surface-2)',
                              color: i === 0 ? '#d97706' : i === 1 ? '#6b7280' : i === 2 ? '#c2410c' : 'var(--text-muted)',
                            }}>
                              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              {c.thumbnail ? (
                                <img src={c.thumbnail} alt="" style={{ width: 40, height: 28, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }} />
                              ) : (
                                <div style={{ width: 40, height: 28, background: 'var(--primary-light)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>📘</div>
                              )}
                              <strong style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200, display: 'block' }}>{c.title}</strong>
                            </div>
                          </td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{c.teacher_name || '—'}</td>
                          <td>
                            <span className="badge badge-primary">👥 {fmt(c.student_count)}</span>
                          </td>
                          <td style={{ fontWeight: 700, color: c.revenue > 0 ? 'var(--success)' : 'var(--text-muted)' }}>
                            {c.revenue > 0 ? fmtMoney(c.revenue) : 'Miễn phí'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
