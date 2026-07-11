import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { courseService } from '../../services/courseService';
import { useToast } from '../../hooks/useToast';
import Modal from '../../components/common/Modal.jsx';

const emptyForm = { id: '', title: '', description: '', thumbnail: '' };

/** Tương đương #coursesView trong _legacy/pages/admin/dashboard.html. */
export default function AdminCourses() {
  const { showToast } = useToast();
  const [allCourses, setAllCourses] = useState(null); // null = đang tải
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const isEditing = !!form.id;

  async function loadCourses() {
    const res = await courseService.getCourses();
    if (res?.ok && res.data?.success) {
      setAllCourses(res.data.data || []);
    } else {
      setAllCourses([]);
    }
  }

  useEffect(() => {
    loadCourses();
  }, []);

  const filtered = useMemo(() => {
    let list = allCourses || [];
    const q = search.toLowerCase().trim();
    if (q) list = list.filter((c) => c.title.toLowerCase().includes(q));
    return list;
  }, [allCourses, search]);

  function openCreateModal() {
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEditModal(c) {
    setForm({ id: c.id, title: c.title, description: c.description || '', thumbnail: c.thumbnail || '' });
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const title = form.title.trim();
    const description = form.description.trim();
    const thumbnail = form.thumbnail.trim();

    try {
      const res = isEditing
        ? await courseService.updateCourse({ id: form.id, title, description, thumbnail })
        : await courseService.createCourse({ title, description, thumbnail });

      if (res?.ok && res.data?.success) {
        showToast(res.data.message || 'Thực hiện thành công', 'success');
        setModalOpen(false);
        loadCourses();
      } else {
        showToast(res?.data?.message || 'Có lỗi xảy ra', 'error');
      }
    } catch {
      showToast('Lỗi máy chủ', 'error');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Bạn có chắc chắn muốn xóa khóa học này?')) return;
    try {
      const res = await courseService.deleteCourse(id);
      if (res?.ok && res.data?.success) {
        showToast('Xóa khóa học thành công!', 'success');
        loadCourses();
      } else {
        showToast(res?.data?.message || 'Có lỗi xảy ra', 'error');
      }
    } catch {
      showToast('Lỗi máy chủ', 'error');
    }
  }

  return (
    <>
      <div className="page-header">
        <div className="breadcrumb">
          <Link to="/admin">Admin</Link> / <span>Quản lý Khóa học</span>
        </div>
        <h1 className="page-title">📚 Quản lý Khóa học</h1>
        <p className="page-subtitle">Thiết lập danh sách khóa học giảng dạy.</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>📚 Quản lý Khóa học</h3>
          <button className="btn btn-primary btn-sm" onClick={openCreateModal}>
            + Thêm Khóa học
          </button>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Tìm tên khóa học..."
              style={{ maxWidth: 300 }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Thumbnail</th>
                  <th>Tên khóa học</th>
                  <th>Người tạo (Giảng viên)</th>
                  <th>Mô tả</th>
                  <th style={{ textAlign: 'right' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {allCourses === null && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      Đang tải danh sách khóa học...
                    </td>
                  </tr>
                )}
                {allCourses !== null && filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      Không tìm thấy khóa học nào.
                    </td>
                  </tr>
                )}
                {filtered.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div
                        style={{
                          width: 50,
                          height: 35,
                          borderRadius: 'var(--radius-sm)',
                          overflow: 'hidden',
                          background: 'var(--primary-light)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {c.thumbnail ? (
                          <img src={c.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          '📘'
                        )}
                      </div>
                    </td>
                    <td>
                      <strong>{c.title}</strong>
                    </td>
                    <td>{c.teacher_name || 'Chưa phân công'}</td>
                    <td
                      style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.8rem',
                        maxWidth: 250,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {c.description || '—'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-outline btn-sm"
                        style={{ padding: '0.25rem 0.5rem', marginRight: '0.25rem' }}
                        onClick={() => openEditModal(c)}
                      >
                        Sửa
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.5rem', background: 'var(--danger)' }}
                        onClick={() => handleDelete(c.id)}
                      >
                        Xóa
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
            <h3>{isEditing ? 'Cập nhật khóa học' : 'Thêm khóa học mới'}</h3>
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
                  placeholder="Lập trình React JS"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Mô tả khóa học</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Mô tả tóm tắt..."
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
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.75rem' }}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setModalOpen(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
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
