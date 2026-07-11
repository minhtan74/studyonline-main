import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';
import { quizService } from '../../services/quizService';
import Modal from '../../components/common/Modal.jsx';

const emptyForm = {
  content: '',
  option_a: '',
  option_b: '',
  option_c: '',
  option_d: '',
  correct_answer: 'A',
  order_index: 0,
};

/**
 * Port của _legacy/pages/teacher/quiz-questions.html + initQuizQuestions()
 * (_legacy/js/quiz.js, dòng 318-438).
 *
 * Bản gốc là 1 trang riêng dùng navbar public thông thường (không có sidebar
 * dashboard) và đọc `?quiz_id=` từ query string. Theo quyết định đã duyệt cho
 * bản React, trang này giờ nằm trong TeacherLayout như mọi trang teacher khác
 * và đọc `quizId` từ route param (`/teacher/quizzes/:quizId/questions`).
 */
export default function TeacherQuizQuestions() {
  const { quizId } = useParams();
  const { showToast } = useToast();

  const [quizTitle, setQuizTitle] = useState('Câu hỏi');
  const [questions, setQuestions] = useState(null); // null = loading

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadQuizTitle() {
      const res = await quizService.getQuiz(Number(quizId));
      const quiz = res?.ok ? res.data.data : null;
      if (!cancelled && quiz) setQuizTitle(quiz.title);
    }
    loadQuizTitle();
    return () => {
      cancelled = true;
    };
  }, [quizId]);

  async function loadQuestions() {
    setQuestions(null);
    const res = await quizService.getQuestions(Number(quizId));
    setQuestions(res?.ok ? res.data.data || [] : []);
  }

  useEffect(() => {
    loadQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId]);

  function openCreateModal() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  async function openEditModal(id) {
    setEditingId(id);
    const res = await quizService.getQuestion(id);
    if (!res?.ok) return;
    const q = res.data.data;
    setForm({
      content: q.content || '',
      option_a: q.option_a || '',
      option_b: q.option_b || '',
      option_c: q.option_c || '',
      option_d: q.option_d || '',
      correct_answer: q.correct_answer || 'A',
      order_index: q.order_index ?? 0,
    });
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      quiz_id: Number(quizId),
      content: form.content.trim(),
      option_a: form.option_a.trim(),
      option_b: form.option_b.trim(),
      option_c: form.option_c.trim(),
      option_d: form.option_d.trim(),
      correct_answer: form.correct_answer,
      order_index: Number(form.order_index || 0),
    };
    const res = editingId
      ? await quizService.updateQuestion({ id: editingId, ...payload })
      : await quizService.createQuestion(payload);
    setSaving(false);

    if (res?.ok && res.data?.success) {
      setModalOpen(false);
      showToast('Thành công!', 'success');
      loadQuestions();
    } else {
      showToast(res?.data?.message || 'Lỗi.', 'error');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Xóa câu hỏi này?')) return;
    const res = await quizService.deleteQuestion(id);
    if (res?.ok) {
      showToast('Đã xóa!', 'success');
      loadQuestions();
    }
  }

  return (
    <>
      <div className="breadcrumb">
        <Link to="/teacher/quizzes">📚 Quản lý Quiz</Link>
        <span className="sep">›</span>
        <span>{quizTitle}</span>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ fontSize: '1.6rem', fontWeight: 800 }}>
            ❓ Quản lý Câu hỏi
          </h1>
          <p className="page-subtitle" style={{ marginTop: '0.25rem', fontSize: '0.88rem' }}>
            Biên soạn nội dung trắc nghiệm và đáp án đúng cho bài kiểm tra.
          </p>
        </div>
        <button className="btn btn-primary" style={{ padding: '0.6rem 1.25rem' }} onClick={openCreateModal}>
          + Thêm câu hỏi mới
        </button>
      </div>

      {questions === null && (
        <div className="loading-page">
          <div className="spinner" />
        </div>
      )}

      {questions !== null && questions.length === 0 && (
        <div className="empty-state">
          <div className="icon">❓</div>
          <h3>Chưa có câu hỏi nào</h3>
        </div>
      )}

      {questions !== null &&
        questions.length > 0 &&
        questions.map((q, i) => (
          <div className="tq-question-card" key={q.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <div className="tq-question-num">Câu hỏi {i + 1}</div>
                <div className="tq-question-content">{q.content}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem', marginTop: '1.25rem' }}>
                  {['A', 'B', 'C', 'D'].map((k) => {
                    const text = q[`option_${k.toLowerCase()}`];
                    if (!text && (k === 'C' || k === 'D')) return null;
                    const isCorrect = k === q.correct_answer;
                    return (
                      <div className={`tq-option-item${isCorrect ? ' correct' : ''}`} key={k}>
                        <span className="tq-option-icon">{isCorrect ? '✅' : '⬜'}</span>
                        <span>
                          <strong>{k}.</strong> {text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                <button className="btn btn-outline btn-sm" onClick={() => openEditModal(q.id)}>
                  ✏️ Sửa
                </button>
                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(q.id)}>
                  ✕ Xóa
                </button>
              </div>
            </div>
          </div>
        ))}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="tq-modal-box" onClick={(e) => e.stopPropagation()}>
          <div className="tq-modal-header">
            <h3>{editingId ? 'Sửa câu hỏi' : 'Thêm câu hỏi'}</h3>
            <button className="tq-modal-close" onClick={() => setModalOpen(false)}>
              ✕
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                Nội dung câu hỏi <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Nhập nội dung câu hỏi..."
                required
                style={{ resize: 'vertical', minHeight: 80 }}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  Đáp án A <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  className="form-control"
                  type="text"
                  placeholder="Nập đáp án A"
                  required
                  value={form.option_a}
                  onChange={(e) => setForm({ ...form, option_a: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Đáp án B <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  className="form-control"
                  type="text"
                  placeholder="Nhập đáp án B"
                  required
                  value={form.option_b}
                  onChange={(e) => setForm({ ...form, option_b: e.target.value })}
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Đáp án C</label>
                <input
                  className="form-control"
                  type="text"
                  placeholder="Nhập đáp án C (tùy chọn)"
                  value={form.option_c}
                  onChange={(e) => setForm({ ...form, option_c: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Đáp án D</label>
                <input
                  className="form-control"
                  type="text"
                  placeholder="Nhập đáp án D (tùy chọn)"
                  value={form.option_d}
                  onChange={(e) => setForm({ ...form, option_d: e.target.value })}
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  Đáp án đúng <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <select
                  className="form-control"
                  required
                  value={form.correct_answer}
                  onChange={(e) => setForm({ ...form, correct_answer: e.target.value })}
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Thứ tự hiển thị</label>
                <input
                  className="form-control"
                  type="number"
                  min="0"
                  value={form.order_index}
                  onChange={(e) => setForm({ ...form, order_index: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>
                Hủy bỏ
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                Lưu câu hỏi
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
