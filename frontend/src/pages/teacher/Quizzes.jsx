import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { courseService } from '../../services/courseService';
import { quizService } from '../../services/quizService';
import Modal from '../../components/common/Modal.jsx';

const emptyForm = { course_id: '', title: '', description: '', duration: 15, passing_score: 80 };

/** Tương đương #quizzesView (view 5) của teacher/dashboard.html — CRUD quiz */
export default function TeacherQuizzes() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [teacherCourses, setTeacherCourses] = useState([]);
  const [quizzes, setQuizzes] = useState(null); // null = loading

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function loadCourses() {
    const res = await courseService.getCourses();
    const allCourses = res?.ok ? res.data.data || [] : [];
    setTeacherCourses(allCourses.filter((c) => c.teacher_id === user?.id || user?.role === 'admin'));
  }

  async function loadQuizzes() {
    setQuizzes(null);
    const res = await quizService.getQuizzes();
    setQuizzes(res?.ok ? res.data.data || [] : []);
  }

  useEffect(() => {
    loadCourses();
    loadQuizzes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  function openCreateModal() {
    setEditingId(null);
    setForm({ ...emptyForm, course_id: teacherCourses.length > 0 ? String(teacherCourses[0].id) : '' });
    setModalOpen(true);
  }

  function openEditModal(q) {
    setEditingId(q.id);
    setForm({
      course_id: String(q.course_id),
      title: q.title || '',
      description: q.description || '',
      duration: q.duration ?? 15,
      passing_score: q.passing_score ?? 80,
    });
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      course_id: Number(form.course_id),
      title: form.title.trim(),
      description: form.description.trim(),
      duration: Number(form.duration || 15),
      passing_score: Number(form.passing_score || 80),
    };
    const res = editingId
      ? await quizService.updateQuiz({ id: Number(editingId), ...payload })
      : await quizService.createQuiz(payload);
    setSaving(false);

    if (res?.ok && res.data?.success) {
      showToast(editingId ? 'Cập nhật đề thi thành công!' : 'Tạo đề thi thành công!', 'success');
      setModalOpen(false);
      loadQuizzes();
    } else {
      showToast(res?.data?.message || 'Có lỗi xảy ra.', 'error');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Bạn có chắc muốn xóa đề thi này và tất cả các câu hỏi?')) return;
    const res = await quizService.deleteQuiz(id);
    if (res?.ok) {
      showToast('Đã xóa Quiz thành công!', 'success');
      loadQuizzes();
    } else {
      showToast(res?.data?.message || 'Không thể xóa.', 'error');
    }
  }

  return (
    <>
      <div className="page-header">
        <div className="breadcrumb">
          <span>Instructor</span> / <span>Quizzes</span>
        </div>
        <h1 className="page-title">📝 Bài thi Trắc nghiệm</h1>
        <p className="page-subtitle">Biên soạn đề thi, theo dõi kết quả tự động.</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>📝 Quản lý Quiz trắc nghiệm</h3>
        <button className="btn btn-primary" onClick={openCreateModal}>
          + Tạo Quiz mới
        </button>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Khóa học</th>
                  <th>Tên Quiz</th>
                  <th>Số câu hỏi</th>
                  <th>Thời gian</th>
                  <th>Điểm đạt</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {quizzes === null && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                      <span
                        className="spinner"
                        style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,.3)', borderTopColor: 'var(--primary)' }}
                      ></span>{' '}
                      Đang tải danh sách Quiz...
                    </td>
                  </tr>
                )}
                {quizzes !== null && quizzes.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      Hệ thống chưa có đề thi trắc nghiệm. Bấm nút Tạo Quiz mới để biên soạn.
                    </td>
                  </tr>
                )}
                {quizzes?.map((q) => (
                  <tr key={q.id}>
                    <td>
                      <strong>{q.course_title || 'Chưa phân loại'}</strong>
                    </td>
                    <td>
                      <strong>{q.title}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{q.description || '—'}</div>
                    </td>
                    <td>
                      <span className="badge badge-primary">{q.question_count || 0} câu hỏi</span>
                    </td>
                    <td>{q.duration || 15} phút</td>
                    <td>{q.passing_score || 80}%</td>
                    <td style={{ textAlign: 'right' }}>
                      <Link
                        className="btn btn-outline btn-sm"
                        style={{ padding: '0.25rem 0.5rem', marginRight: '0.25rem' }}
                        to={`/teacher/quizzes/${q.id}/questions`}
                      >
                        Câu hỏi
                      </Link>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEditModal(q)}>
                        ✏️
                      </button>
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(q.id)}>
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <div
          className="card modal-panel"
          style={{ width: '100%', maxWidth: 460, margin: '1.5rem', animation: 'modalFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="card-header">
            <h3>{editingId ? 'Chỉnh sửa đề thi' : 'Tạo bài thi Quiz'}</h3>
            <button className="btn-icon" onClick={() => setModalOpen(false)}>
              ✕
            </button>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Thuộc khóa học</label>
                <select
                  className="form-control"
                  required
                  value={form.course_id}
                  onChange={(e) => setForm({ ...form, course_id: e.target.value })}
                >
                  {teacherCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Tiêu đề Quiz</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  placeholder="Kiểm tra kiến thức Chương 1"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Mô tả ngắn</label>
                <textarea
                  className="form-control"
                  rows={2}
                  placeholder="Giới thiệu nội dung bài test..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Thời gian (Phút)</label>
                  <input
                    type="number"
                    className="form-control"
                    required
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Điểm đạt (%)</label>
                  <input
                    type="number"
                    className="form-control"
                    required
                    value={form.passing_score}
                    onChange={(e) => setForm({ ...form, passing_score: e.target.value })}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setModalOpen(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                  Lưu lại
                </button>
              </div>
            </form>
          </div>
        </div>
      </Modal>
    </>
  );
}
