import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { quizService } from '../services/quizService';

const OPTION_KEYS = ['A', 'B', 'C', 'D'];

/** Tương đương initQuizShow() trong _legacy/js/quiz.js + _legacy/pages/quiz-show.html */
export default function QuizShow() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const quizId = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); // { [questionId]: 'A'|'B'|'C'|'D' }
  const [alertMsg, setAlertMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!quizId) return;
    let cancelled = false;
    setLoading(true);
    setAlertMsg(null);
    setAnswers({});

    (async () => {
      const [qRes, questionsRes] = await Promise.all([
        quizService.getQuiz(Number(quizId)),
        quizService.getQuestions(Number(quizId)),
      ]);
      if (cancelled) return;

      const quizData = qRes?.data?.data;
      const questionsData = questionsRes?.data?.data || [];

      if (quizData) document.title = `${quizData.title} — StudyOnline`;

      setQuiz(quizData || null);
      setQuestions(questionsData);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [quizId]);

  function selectAnswer(questionId, key) {
    setAnswers((prev) => ({ ...prev, [questionId]: key }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setAlertMsg(null);

    const unanswered = questions.filter((q) => !answers[q.id]);
    if (unanswered.length > 0) {
      setAlertMsg({
        type: 'warning',
        text: `⚠️ Bạn còn ${unanswered.length} câu chưa trả lời. Vui lòng hoàn thành trước khi nộp bài.`,
      });
      return;
    }

    setSubmitting(true);
    const res = await quizService.submitQuiz(Number(quizId), answers);
    setSubmitting(false);

    // Backend dùng array_merge nên data nằm ở root: { success, quiz, score, total, percent, details }
    if (res?.ok && res.data?.success) {
      navigate('/student/quiz-result', { state: res.data });
    } else {
      setAlertMsg({ type: 'danger', text: res?.data?.message || 'Có lỗi khi nộp bài. Vui lòng thử lại.' });
    }
  }

  if (!quizId) {
    return (
      <main className="s-main q-container">
        <div className="alert alert-danger">Thiếu tham số quiz.</div>
      </main>
    );
  }

  return (
    <main className="s-main q-container">
      {/* Breadcrumb */}
      <nav className="q-breadcrumb" aria-label="Breadcrumb">
        <Link to="/student/dashboard">Dashboard</Link>
        <span className="q-breadcrumb-separator">›</span>
        <Link to="/quiz">Danh sách Quiz</Link>
        <span className="q-breadcrumb-separator">›</span>
        <span className="q-breadcrumb-current">{quiz?.title || 'Làm bài Quiz'}</span>
      </nav>

      {/* Quiz Header */}
      <div className="q-header">
        <h1 className="q-title">{loading ? 'Đang tải...' : quiz?.title || 'Không tìm thấy quiz'}</h1>
        <p className="q-subtitle">
          {loading
            ? 'Vui lòng đợi trong giây lát...'
            : quiz
              ? `${questions.length} câu hỏi · ${quiz.course_title}`
              : ''}
        </p>
      </div>

      <div className="mb-4">
        {alertMsg && <div className={`alert alert-${alertMsg.type}`}>{alertMsg.text}</div>}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {loading && (
            <div style={{ textAlign: 'center', padding: '5rem 0' }}>
              <div className="spinner mb-4"></div>
              <p style={{ fontSize: '0.9rem', color: 'var(--s-text-muted)', fontWeight: 500 }}>Đang tải câu hỏi...</p>
            </div>
          )}

          {!loading && !quiz && <div className="alert alert-danger">Không tìm thấy quiz.</div>}

          {!loading && quiz && questions.length === 0 && (
            <div className="empty-state">
              <div className="icon">📝</div>
              <h3>Quiz chưa có câu hỏi</h3>
            </div>
          )}

          {!loading &&
            quiz &&
            questions.length > 0 &&
            questions.map((q, i) => (
              <div key={q.id} className="question-card">
                <div className="question-num">Câu {i + 1}</div>
                <div className="question-content">{q.content}</div>
                <ul className="option-list">
                  {OPTION_KEYS.map((k) => (
                    <li key={k} className="option-item">
                      <input
                        type="radio"
                        name={`answers[${q.id}]`}
                        id={`q${q.id}_${k}`}
                        value={k}
                        checked={answers[q.id] === k}
                        onChange={() => selectAnswer(q.id, k)}
                        required
                      />
                      <label htmlFor={`q${q.id}_${k}`}>
                        <span className="option-key">{k}</span>
                        {q[`option_${k.toLowerCase()}`]}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </div>

        {!loading && quiz && questions.length > 0 && (
          <div className="q-footer-actions">
            <Link to="/quiz" className="s-btn s-btn-outline">
              ← Quay lại
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--s-text-muted)', fontWeight: 500 }}>
                <span style={{ fontWeight: 700, color: 'var(--s-text)' }}>{questions.length}</span> câu hỏi
              </span>
              <button type="submit" className="s-btn s-btn-primary" disabled={submitting}>
                {submitting ? (
                  <>
                    <span className="spinner"></span> Đang chấm bài...
                  </>
                ) : (
                  '🚀 Nộp bài'
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </main>
  );
}
