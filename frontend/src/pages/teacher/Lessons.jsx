import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { courseService } from '../../services/courseService';
import { chapterService } from '../../services/chapterService';
import { lessonService } from '../../services/lessonService';
import Modal from '../../components/common/Modal.jsx';
import LessonPreviewModal from '../../components/teacher/LessonPreviewModal.jsx';

const emptyForm = { title: '', description: '', video_url: '', document_url: '' };

/**
 * Tương đương #lessonsView (view 4) của teacher/dashboard.html — dropdown
 * khóa học + chương học (cascading) điều khiển bảng CRUD bài học.
 */
export default function TeacherLessons() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [teacherCourses, setTeacherCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [chapters, setChapters] = useState([]);
  const [selectedChapterId, setSelectedChapterId] = useState('');
  const [lessons, setLessons] = useState(null); // null = loading / chưa chọn chương

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [previewLesson, setPreviewLesson] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Load khóa học của giảng viên — select mặc định chọn khóa học đầu tiên,
  // giống hành vi populateCourseDropdowns() của bản gốc (không có option rỗng).
  useEffect(() => {
    let cancelled = false;
    async function loadCourses() {
      const res = await courseService.getCourses();
      const allCourses = res?.ok ? res.data.data || [] : [];
      const mine = allCourses.filter((c) => c.teacher_id === user?.id || user?.role === 'admin');
      if (cancelled) return;
      setTeacherCourses(mine);
      if (mine.length > 0) setSelectedCourseId(String(mine[0].id));
    }
    loadCourses();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // onLessonCourseChange(): tải danh sách chương của khóa học đã chọn, mặc định chọn chương đầu tiên
  useEffect(() => {
    let cancelled = false;
    async function loadChapters() {
      if (!selectedCourseId) {
        setChapters([]);
        setSelectedChapterId('');
        return;
      }
      const res = await chapterService.getChapters(Number(selectedCourseId));
      const list = res?.ok ? res.data.data || [] : [];
      if (cancelled) return;
      setChapters(list);
      setSelectedChapterId(list.length > 0 ? String(list[0].id) : '');
    }
    loadChapters();
    return () => {
      cancelled = true;
    };
  }, [selectedCourseId]);

  // onLessonChapterChange(): tải bài học của chương đã chọn
  async function loadLessons(chapterId) {
    if (!chapterId) {
      setLessons(null);
      return;
    }
    setLessons(null);
    const res = await lessonService.getLessons(Number(chapterId));
    setLessons(res?.ok ? res.data.data || [] : []);
  }

  useEffect(() => {
    loadLessons(selectedChapterId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChapterId]);

  function openCreateModal() {
    if (!selectedChapterId) {
      showToast('Vui lòng chọn chương học trước!', 'error');
      return;
    }
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEditModal(l) {
    setEditingId(l.id);
    setForm({
      title: l.title || '',
      description: l.description || '',
      video_url: l.video_url || '',
      document_url: l.document_url || '',
    });
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      chapter_id: Number(selectedChapterId),
      title: form.title.trim(),
      description: form.description.trim(),
      video_url: form.video_url.trim(),
      document_url: form.document_url.trim(),
    };
    const res = editingId
      ? await lessonService.updateLesson({ id: Number(editingId), ...payload })
      : await lessonService.createLesson(payload);
    setSaving(false);

    if (res?.ok && res.data?.success) {
      showToast(editingId ? 'Cập nhật bài học thành công!' : 'Tạo bài học thành công!', 'success');
      setModalOpen(false);
      loadLessons(selectedChapterId);
    } else {
      showToast(res?.data?.message || 'Có lỗi xảy ra.', 'error');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Bạn muốn xóa bài giảng này?')) return;
    const res = await lessonService.deleteLesson(id);
    if (res?.ok) {
      showToast('Đã xóa bài học!', 'success');
      loadLessons(selectedChapterId);
    } else {
      showToast(res?.data?.message || 'Không thể xóa.', 'error');
    }
  }

  async function handlePreview(id) {
    const res = await lessonService.getLesson(id);
    const lesson = res?.ok ? res.data.data : null;
    if (!lesson) {
      showToast('Không tìm thấy thông tin bài học', 'error');
      return;
    }
    setPreviewLesson(lesson);
    setPreviewOpen(true);
  }

  return (
    <>
      <div className="page-header">
        <div className="breadcrumb">
          <span>Instructor</span> / <span>Lessons</span>
        </div>
        <h1 className="page-title">🎥 Quản lý Bài học</h1>
        <p className="page-subtitle">Cập nhật tài liệu, video bài giảng cho từng chương học.</p>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-body" style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label className="form-label">Chọn Khóa học:</label>
            <select className="form-control" value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)}>
              {teacherCourses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label className="form-label">Chọn Chương học:</label>
            <select className="form-control" value={selectedChapterId} onChange={(e) => setSelectedChapterId(e.target.value)}>
              {chapters.length === 0 && <option value="">(Chưa có chương học)</option>}
              {chapters.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  {ch.chapter_name}
                </option>
              ))}
            </select>
          </div>
          <button className="btn btn-primary" onClick={openCreateModal}>
            + Thêm Bài học mới
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>🎥 Danh sách bài giảng</h3>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Tên bài học</th>
                  <th>Video URL</th>
                  <th>Tài liệu PDF</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {!selectedChapterId && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      Vui lòng chọn hoặc thêm chương học trước.
                    </td>
                  </tr>
                )}
                {selectedChapterId && lessons === null && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                      <span
                        className="spinner"
                        style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,.3)', borderTopColor: 'var(--primary)' }}
                      ></span>{' '}
                      Đang tải bài giảng...
                    </td>
                  </tr>
                )}
                {selectedChapterId && lessons !== null && lessons.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      Chưa có bài học nào trong chương này. Bấm nút Thêm Bài học phía trên để bắt đầu.
                    </td>
                  </tr>
                )}
                {selectedChapterId &&
                  lessons !== null &&
                  lessons.map((l, i) => (
                    <tr key={l.id}>
                      <td>
                        <strong>{i + 1}</strong>
                      </td>
                      <td>
                        <strong>{l.title}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {l.description || '—'}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--primary)' }}>
                          {l.video_url || 'Chưa upload'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>{l.document_url ? '📎 Xem PDF' : 'Trống'}</span>
                      </td>
                      <td>
                        <span className="badge badge-success">Active</span>
                      </td>
                      <td>{new Date().toLocaleDateString('vi-VN')}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn btn-outline btn-sm" style={{ padding: '0.25rem 0.5rem', marginRight: '0.25rem' }} onClick={() => handlePreview(l.id)}>
                          Xem trước
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEditModal(l)}>
                          ✏️
                        </button>
                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(l.id)}>
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
          style={{ width: '100%', maxWidth: 480, margin: '1.5rem', animation: 'modalFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="card-header">
            <h3>{editingId ? 'Sửa bài học' : 'Tạo bài học mới'}</h3>
            <button className="btn-icon" onClick={() => setModalOpen(false)}>
              ✕
            </button>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Tên bài học</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  placeholder="Bài 1: Cài đặt môi trường Dev"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Mô tả bài học</label>
                <textarea
                  className="form-control"
                  rows={2}
                  placeholder="Nội dung tóm tắt bài giảng..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Video URL</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="https://youtube.com/embed/... hoặc tên file video"
                  value={form.video_url}
                  onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Tài liệu PDF URL</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="https://docs.google.com/... hoặc link tải tài liệu"
                  value={form.document_url}
                  onChange={(e) => setForm({ ...form, document_url: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setModalOpen(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                  Lưu bài học
                </button>
              </div>
            </form>
          </div>
        </div>
      </Modal>

      <LessonPreviewModal open={previewOpen} onClose={() => setPreviewOpen(false)} lesson={previewLesson} />
    </>
  );
}
