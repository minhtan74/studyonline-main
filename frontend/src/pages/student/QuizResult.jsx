import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const OPTION_KEYS = ['A', 'B', 'C', 'D'];

/** Tương đương initQuizResult() trong _legacy/js/quiz.js + _legacy/pages/student/quiz-result.html
 * Thay cho localStorage 'quiz_result' cũ: dữ liệu được truyền qua navigate(..., { state }) từ QuizShow.jsx.
 * Refresh trang này (mất state) -> bounce về /quiz, giữ đúng hành vi "one-shot" của bản gốc.
 */
export default function QuizResult() {
  const { state } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!state) {
      navigate('/quiz', { replace: true });
      return;
    }
    if (state.quiz?.title) document.title = `Kết quả: ${state.quiz.title}`;
  }, [state, navigate]);

  if (!state) return null;

  const { quiz, score, total, percent, details } = state;
  const color = percent >= 80 ? 'var(--s-success)' : percent >= 50 ? 'var(--s-warning)' : 'var(--s-danger)';

  return (
    <main className="s-main q-container">
      {/* Breadcrumbs */}
      <nav className="q-breadcrumb" aria-label="Breadcrumb">
        <Link to="/student/dashboard">Dashboard</Link>
        <span className="q-breadcrumb-separator">›</span>
        <Link to="/quiz">Danh sách Quiz</Link>
        <span className="q-breadcrumb-separator">›</span>
        <span className="q-breadcrumb-current">Kết quả bài làm</span>
      </nav>

      {/* Score Overview Panel */}
      <div className="q-score-panel">
        <div
          id="scoreCircle"
          className="q-score-circle-wrap"
          style={{ background: `conic-gradient(${color} ${percent * 3.6}deg, var(--s-surface-2) 0deg)` }}
        >
          <div className="q-score-circle-inner">
            <div
              style={{
                fontSize: '1.05rem',
                color: 'var(--s-text-muted)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.25rem',
              }}
            >
              Kết quả
            </div>
            <span style={{ color, fontSize: '4rem', lineHeight: 1, fontWeight: 900 }}>
              {score}
              <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--s-text-muted)' }}>/{total}</span>
            </span>
            <span
              style={{
                fontSize: '0.95rem',
                color: 'var(--s-text-muted)',
                fontWeight: 600,
                marginTop: '0.6rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span style={{ color: 'var(--s-success)' }}>✓ {score} Đúng</span>
              <span style={{ color: 'var(--s-border)' }}>|</span>
              <span style={{ color: 'var(--s-danger)' }}>✗ {total - score} Sai</span>
            </span>
            <div
              style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                color,
                marginTop: '0.6rem',
                background: `${color}10`,
                padding: '0.25rem 0.75rem',
                borderRadius: '20px',
              }}
            >
              Đạt {percent}%
            </div>
          </div>
        </div>

        <div id="scoreSummary" className="q-score-summary">
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--s-text)', marginBottom: '0.25rem' }}>{quiz.title}</h2>
          <p style={{ color: 'var(--s-text-muted)', marginBottom: '0.5rem' }}>{quiz.course_title}</p>
        </div>
      </div>

      {/* Detail Card Header */}
      <div className="q-detail-header">
        <h3>Chi tiết câu trả lời</h3>
        <span>Xem lại các lỗi sai của bạn</span>
      </div>

      {/* Detail Question List */}
      <div id="detailList">
        {details.map((d, i) => (
          <div key={i} className="question-card">
            <div className="question-num">
              <span>Câu {i + 1}</span>
              <span
                className={`s-badge ${d.is_right ? 's-badge-green' : 's-badge-warn'}`}
                style={{ textTransform: 'none', letterSpacing: 'normal' }}
              >
                {d.is_right ? '✓ Đúng' : '✗ Sai'}
              </span>
            </div>
            <div className="question-content">{d.content}</div>
            <ul className="option-list">
              {OPTION_KEYS.map((k) => {
                let cls = '';
                let suffix = null;
                if (k === d.correct_answer) {
                  cls = 'option-correct';
                  if (k === d.chosen) {
                    suffix = (
                      <span
                        className="s-badge s-badge-green"
                        style={{ marginLeft: 'auto', fontSize: '0.7rem', textTransform: 'none', letterSpacing: 'normal', padding: '0.15rem 0.5rem' }}
                      >
                        Bạn chọn
                      </span>
                    );
                  }
                } else if (k === d.chosen && !d.is_right) {
                  cls = 'option-wrong';
                  suffix = (
                    <span
                      className="s-badge s-badge-warn"
                      style={{
                        marginLeft: 'auto',
                        fontSize: '0.7rem',
                        textTransform: 'none',
                        letterSpacing: 'normal',
                        padding: '0.15rem 0.5rem',
                        color: 'var(--s-danger)',
                        background: 'rgba(239, 68, 68, 0.1)',
                      }}
                    >
                      Bạn chọn
                    </span>
                  );
                }
                return (
                  <li key={k} className={`option-item ${cls}`}>
                    <span className="option-key">{k}</span>
                    <span className="option-text">{d[`option_${k.toLowerCase()}`]}</span>
                    {suffix}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </main>
  );
}
