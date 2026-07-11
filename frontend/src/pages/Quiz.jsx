import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { quizService } from '../services/quizService';

/** Tương đương initQuizList() trong _legacy/js/quiz.js + _legacy/pages/quiz.html */
export default function Quiz() {
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('course_id');
  const { user } = useAuth();
  const isManager = user?.role === 'admin' || user?.role === 'teacher';

  const [quizzes, setQuizzes] = useState(null); // null = đang tải

  async function loadQuizzes() {
    setQuizzes(null);
    const res = await quizService.getQuizzes(courseId);
    setQuizzes(res?.data?.data || []);
  }

  useEffect(() => {
    loadQuizzes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  async function handleDelete(id) {
    if (!window.confirm('Xóa quiz này?')) return;
    const r = await quizService.deleteQuiz(id);
    if (r?.ok) loadQuizzes();
  }

  return (
    <main className="s-main q-container">
      <div className="q-header">
        <h1 className="q-title">📝 Danh sách Quiz</h1>
        <p className="q-subtitle">Chọn một bài tập trắc nghiệm dưới đây để kiểm tra và củng cố kiến thức học tập.</p>
      </div>

      <div id="quizList" className="q-card-list">
        {quizzes === null && (
          <div style={{ textAlign: 'center', padding: '5rem 0' }}>
            <div className="spinner mb-4"></div>
            <p style={{ fontSize: '0.9rem', color: 'var(--s-text-muted)', fontWeight: 500 }}>
              Đang tải danh sách quiz...
            </p>
          </div>
        )}

        {quizzes !== null && quizzes.length === 0 && (
          <div className="s-empty">
            <div className="icon">📝</div>
            <h3>Chưa có quiz nào</h3>
          </div>
        )}

        {quizzes !== null &&
          quizzes.length > 0 &&
          quizzes.map((q) => (
            <div key={q.id} className="s-card" style={{ marginBottom: '1rem' }}>
              <div
                className="s-card-body"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}
              >
                <div>
                  <h3 style={{ fontSize: '1.05rem', marginBottom: '.25rem', fontWeight: 700 }}>{q.title}</h3>
                  <span className="s-badge s-badge-blue">{q.question_count} câu hỏi</span>
                  {q.course_title && (
                    <span className="s-badge s-badge-green" style={{ marginLeft: '.5rem' }}>
                      {q.course_title}
                    </span>
                  )}
                  <p style={{ marginTop: '.5rem', fontSize: '.875rem', color: 'var(--s-text-muted)' }}>
                    {q.description || ''}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                  <Link className="s-btn s-btn-primary s-btn-sm" to={`/quiz-show?id=${q.id}`}>
                    Làm bài
                  </Link>
                  {isManager && (
                    <>
                      <Link className="s-btn s-btn-outline s-btn-sm" to={`/teacher/quizzes/${q.id}/questions`}>
                        Câu hỏi
                      </Link>
                      <button className="s-btn s-btn-danger s-btn-sm" onClick={() => handleDelete(q.id)}>
                        Xóa
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
      </div>
    </main>
  );
}
