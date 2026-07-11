import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { courseService } from '../../services/courseService';
import { enrollmentService } from '../../services/enrollmentService';
import Modal from '../../components/common/Modal.jsx';

const emptyForm = { title: '', description: '', thumbnail: '', price: '', status: 'active' };

/** Tương đương #coursesView (view 2) của teacher/dashboard.html — CRUD khóa học của giảng viên */
export default function TeacherCourses() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [teacherCourses, setTeacherCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function loadData() {
    setLoading(true);
    const [coursesRes, enrollRes] = await Promise.all([courseService.getCourses(), enrollmentService.getEnrollments()]);
    const allCourses = coursesRes?.ok ? coursesRes.data.data || [] : [];
    setTeacherCourses(allCourses.filter((c) => c.teacher_id === user?.id || user?.role === 'admin'));
    setEnrollments(enrollRes?.ok ? enrollRes.data.data || [] : []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const filteredCourses = useMemo(() => {
    let list = teacherCourses;
    const q = search.toLowerCase().trim();
    if (q) list = list.filter((c) => c.title.toLowerCase().includes(q));
    if (statusFilter !== 'all') list = list.filter((c) => c.status === statusFilter);
    return list;
  }, [teacherCourses, search, statusFilter]);

  function openCreateModal() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEditModal(c) {
    setEditingId(c.id);
    setForm({
      title: c.title || '',
      description: c.description || '',
      thumbnail: c.thumbnail || '',
      price: c.price ?? 0,
      status: c.status || 'active',
    });
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      thumbnail: form.thumbnail.trim(),
      price: Number(form.price || 0),
      status: form.status,
    };
    const res = editingId
      ? await courseService.updateCourse({ id: Number(editingId), ...payload })
      : await courseService.createCourse(payload);
    setSaving(false);

    if (res?.ok && res.data?.success) {
      showToast(editingId ? 'Cập nhật khóa học thành công!' : 'Tạo khóa học thành công!', 'success');
      setModalOpen(false);
      loadData();
    } else {
      showToast(res?.data?.message || 'Lỗi thao tác.', 'error');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Bạn có chắc muốn xóa khóa học này cùng toàn bộ chương và bài học?')) return;
    const res = await courseService.deleteCourse(id);
    if (res?.ok) {
      showToast('Xóa khóa học thành công!', 'success');
      loadData();
    } else {
      showToast(res?.data?.message || 'Không thể xóa khóa học.', 'error');
    }
  }

  function manageCourseChapters(courseId) {
    navigate(`/teacher/chapters?course_id=${courseId}`);
  }

  return (
    <>
      <div className="page-header">
        <div className="breadcrumb">
          <span>Instructor</span> / <span>Courses</span>
        </div>
        <h1 className="page-title">📚 Khóa học của tôi</h1>
        <p className="page-subtitle">Quản lý thông tin chi tiết, trạng thái kích hoạt khóa học.</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flex: 1, maxWidth: 500 }}>
          <input
            type="text"
            className="form-control"
            placeholder="Tìm tên khóa học..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="form-control"
            style={{ maxWidth: 180 }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang kích hoạt</option>
            <option value="draft">Bản nháp</option>
          </select>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          + Thêm Khóa học
        </button>
      </div>

      {loading ? (
        <div className="loading-page">
          <div className="spinner" />
        </div>
      ) : (
        <div className="course-card-grid">
          {filteredCourses.length === 0 && (
            <div className="card" style={{ gridColumn: '1/-1', padding: '3rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
              <h3>Không tìm thấy khóa học nào</h3>
            </div>
          )}
          {filteredCourses.map((c) => {
            const studentCount = enrollments.filter((e) => e.course_id === c.id).length;
            const courseEnrolled = enrollments.filter((e) => e.course_id === c.id);
            const avgProgress =
              courseEnrolled.length > 0
                ? Math.round(
                    courseEnrolled.reduce((sum, e) => {
                      const total = Number(e.total_lessons || 0);
                      const completed = Number(e.completed_lessons || 0);
                      return sum + (total > 0 ? (completed / total) * 100 : 0);
                    }, 0) / courseEnrolled.length,
                  )
                : 0;

            return (
              <div className="course-dash-card" key={c.id}>
                <div className="course-dash-thumb">
                  <img
                    src={c.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=320&auto=format&fit=crop'}
                    alt={c.title}
                  />
                  <span className="course-dash-badge">{c.status === 'draft' ? 'Bản nháp' : 'Active'}</span>
                </div>
                <div className="course-dash-body">
                  <h3 className="course-dash-title">{c.title}</h3>
                  <p className="course-dash-desc">{c.description || 'Chưa có mô tả ngắn...'}</p>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.75rem' }}>
                    {Number(c.price || 0).toLocaleString()} VNĐ
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span>Tiến độ học viên TB</span>
                    <span>{avgProgress}%</span>
                  </div>
                  <div className="course-progress-bar" style={{ marginTop: 0 }}>
                    <div className="course-progress-fill" style={{ width: `${avgProgress}%` }}></div>
                  </div>

                  <div className="course-dash-meta">
                    <span>👥 {studentCount} Học viên</span>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button className="btn btn-outline btn-sm" style={{ padding: '0.25rem 0.5rem' }} onClick={() => manageCourseChapters(c.id)}>
                        Quản lý
                      </button>
                      <button className="btn btn-ghost btn-sm" style={{ padding: '0.25rem 0.5rem' }} onClick={() => openEditModal(c)}>
                        ✏️
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '0.25rem 0.5rem', color: 'var(--danger)' }}
                        onClick={() => handleDelete(c.id)}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <div
          className="card modal-panel"
          style={{ width: '100%', maxWidth: 480, margin: '1.5rem', animation: 'modalFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="card-header">
            <h3>{editingId ? 'Chỉnh sửa khóa học' : 'Tạo khóa học mới'}</h3>
            <button className="btn-icon" onClick={() => setModalOpen(false)}>
              ✕
            </button>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Tên khóa học</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  placeholder="Lập trình React JS nâng cao"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Mô tả ngắn</label>
                <textarea
                  className="form-control"
                  rows={3}
                  required
                  placeholder="Mô tả tóm tắt nội dung..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Thumbnail URL</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="https://images.unsplash.com/..."
                  value={form.thumbnail}
                  onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
                />
              </div>
              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Giá bán (VNĐ)</label>
                  <input
                    type="number"
                    className="form-control"
                    required
                    placeholder="599000"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Trạng thái</label>
                  <select className="form-control" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="active">Đang kích hoạt (Active)</option>
                    <option value="draft">Bản nháp (Draft)</option>
                  </select>
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
