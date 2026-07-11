import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { courseService } from '../services/courseService';
import Modal from '../components/common/Modal.jsx';

/** Trang quản lý khóa học generic (courses.html cũ) — CRUD cho admin/teacher, chỉ xem cho student */
export default function Courses() {
  const { user } = useAuth();
  const isManager = user?.role === 'admin' || user?.role === 'teacher';

  const [courses, setCourses] = useState(null); // null = loading
  const [alert, setAlert] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  async function loadCourses() {
    setCourses(null);
    const res = await courseService.getCourses();
    if (!res?.ok) {
      setCourses([]);
      return;
    }
    setCourses(res.data.data || []);
  }

  useEffect(() => {
    loadCourses();
  }, []);

  function openCreateModal() {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setModalOpen(true);
  }

  function openEditModal(c) {
    setEditingId(c.id);
    setTitle(c.title || '');
    setDescription(c.description || '');
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);

    const payload = { title: title.trim(), description: description.trim() };
    const res = editingId
      ? await courseService.updateCourse({ id: editingId, ...payload })
      : await courseService.createCourse(payload);

    setSaving(false);
    if (res?.ok && res.data?.success) {
      setModalOpen(false);
      setAlert({ type: 'success', message: editingId ? 'Cập nhật thành công!' : 'Thêm thành công!' });
      loadCourses();
    } else {
      setAlert({ type: 'danger', message: res?.data?.message || 'Có lỗi xảy ra.' });
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Bạn chắc muốn xóa khóa học này?')) return;
    const res = await courseService.deleteCourse(id);
    if (res?.ok) {
      setAlert({ type: 'success', message: 'Xóa thành công!' });
      loadCourses();
    }
  }

  return (
    <main className="py-8 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">📚 Khóa học</h1>
            <p className="text-slate-500 text-sm mt-1">Quản lý toàn bộ khóa học trên hệ thống</p>
          </div>
          {isManager && (
            <button
              onClick={openCreateModal}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-all shadow-sm hover:shadow-md flex items-center gap-2"
            >
              + Thêm khóa học
            </button>
          )}
        </div>

        <div className="mb-4">
          {alert && <div className={`alert alert-${alert.type}`}>{alert.message}</div>}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-5 py-3.5 text-xs font-bold uppercase text-slate-500 tracking-wider">
                    Tên khóa học
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold uppercase text-slate-500 tracking-wider">
                    ID
                  </th>
                  <th className="text-right px-5 py-3.5 text-xs font-bold uppercase text-slate-500 tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {courses === null && (
                  <tr>
                    <td colSpan={3} className="loading-page">
                      <div className="spinner" />
                    </td>
                  </tr>
                )}
                {courses?.length === 0 && (
                  <tr>
                    <td colSpan={3}>
                      <div className="empty-state">
                        <div className="icon">📚</div>
                        <h3>Chưa có khóa học nào</h3>
                      </div>
                    </td>
                  </tr>
                )}
                {courses?.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontSize: '1.1rem',
                            flexShrink: 0,
                          }}
                        >
                          📘
                        </div>
                        <div>
                          <strong>{c.title}</strong>
                          <div style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>
                            {(c.description || '').slice(0, 60)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-primary">{c.id}</span>
                    </td>
                    <td>
                      <Link className="btn btn-outline btn-sm" to={`/teacher/chapters?course_id=${c.id}`}>
                        Xem chương
                      </Link>
                      {isManager && (
                        <>
                          <button
                            className="btn btn-sm"
                            style={{ background: 'var(--surface-2)' }}
                            onClick={() => openEditModal(c)}
                          >
                            Sửa
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>
                            Xóa
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">{editingId ? 'Sửa khóa học' : 'Thêm khóa học'}</h3>
            <button
              onClick={() => setModalOpen(false)}
              className="text-slate-400 hover:text-slate-600 text-2xl leading-none transition-colors"
            >
              ×
            </button>
          </div>
          <div className="px-6 py-5">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Tiêu đề khóa học <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  type="text"
                  placeholder="Vd: Lập trình PHP từ cơ bản..."
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mô tả</label>
                <textarea
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-y min-h-[100px]"
                  placeholder="Mô tả ngắn về khóa học..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-sm rounded-xl transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-all shadow-sm"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      </Modal>
    </main>
  );
}
