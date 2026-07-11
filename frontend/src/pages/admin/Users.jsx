import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { userService } from '../../services/userService';
import { useToast } from '../../hooks/useToast';
import Modal from '../../components/common/Modal.jsx';

/** Tương đương renderUsersTable() row avatar: từ cuối cùng, 2 ký tự đầu, in hoa. */
function rowInitials(fullname) {
  return fullname ? fullname.split(' ').pop().slice(0, 2).toUpperCase() : 'U';
}

function roleBadgeClass(role) {
  return role === 'admin' ? 'badge-danger' : role === 'teacher' ? 'badge-success' : 'badge-primary';
}

const TITLE_BY_FILTER = {
  teacher: '👨‍🏫 Quản lý Giảng viên',
  student: '🎒 Quản lý Học viên',
};
const DEFAULT_TITLE = '👥 Quản lý Thành viên';

const emptyForm = { id: '', fullname: '', email: '', password: '', role: 'student' };

/**
 * Tương đương #usersView trong _legacy/pages/admin/dashboard.html — dùng chung cho
 * cả 3 view "users"/"teachers"/"students" cũ (renderUsersTable/filterUsersList),
 * nay tách biệt qua prop roleFilter (null = tab "Users" chung, 'teacher'/'student' = tab riêng).
 *
 * @param {{ roleFilter: null | 'teacher' | 'student' }} props
 */
export default function AdminUsers({ roleFilter }) {
  const { showToast } = useToast();
  const [allUsers, setAllUsers] = useState(null); // null = đang tải
  const [search, setSearch] = useState('');
  const [roleSelect, setRoleSelect] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const isEditing = !!form.id;

  async function loadUsers() {
    const res = await userService.getUsers();
    if (res?.ok && res.data?.success) {
      setAllUsers(res.data.data || []);
    } else {
      setAllUsers([]);
    }
  }

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    let list = allUsers || [];
    // roleFilter (từ route /admin/teachers, /admin/students) luôn thắng; ngược lại
    // (tab /admin/users chung) thì dùng select role trong trang, như filterUsersList() gốc.
    const effectiveRole = roleFilter || (roleSelect !== 'all' ? roleSelect : null);
    if (effectiveRole) {
      list = list.filter((u) => u.role === effectiveRole);
    }
    const q = search.toLowerCase().trim();
    if (q) {
      list = list.filter((u) => u.fullname.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    return list;
  }, [allUsers, roleFilter, roleSelect, search]);

  const breadcrumbText = 'Quản lý User';
  const pageTitle = TITLE_BY_FILTER[roleFilter] || DEFAULT_TITLE;

  function openCreateModal() {
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEditModal(u) {
    setForm({ id: u.id, fullname: u.fullname, email: u.email, password: '', role: u.role });
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const fullname = form.fullname.trim();
    const email = form.email.trim();
    const password = form.password.trim();
    const role = form.role;

    try {
      const res = isEditing
        ? await userService.updateUser({ id: form.id, fullname, email, role })
        : await userService.createUser({ fullname, email, password, role });

      if (res?.ok && res.data?.success) {
        showToast(res.data.message || 'Thực hiện thành công', 'success');
        setModalOpen(false);
        loadUsers();
      } else {
        showToast(res?.data?.message || 'Có lỗi xảy ra', 'error');
      }
    } catch {
      showToast('Không thể kết nối máy chủ.', 'error');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thành viên này?')) return;
    try {
      const res = await userService.deleteUser(id);
      if (res?.ok && res.data?.success) {
        showToast('Xóa thành viên thành công!', 'success');
        loadUsers();
      } else {
        showToast(res?.data?.message || 'Có lỗi xảy ra', 'error');
      }
    } catch {
      showToast('Lỗi kết nối máy chủ', 'error');
    }
  }

  return (
    <>
      <div className="page-header">
        <div className="breadcrumb">
          <Link to="/admin">Admin</Link> / <span>{breadcrumbText}</span>
        </div>
        <h1 className="page-title">{pageTitle}</h1>
        <p className="page-subtitle">Xem danh sách, phân quyền và chỉnh sửa thông tin thành viên.</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>👥 Quản lý Thành viên</h3>
          <button className="btn btn-primary btn-sm" onClick={openCreateModal}>
            + Thêm Thành viên
          </button>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Tìm tên hoặc email..."
              style={{ maxWidth: 300 }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {/* Select role chỉ hiển thị ở tab "Users" chung (roleFilter null) — với tab
                teacher/student riêng, chính tab đó đã là bộ lọc nên select sẽ dư thừa. */}
            {!roleFilter && (
              <select
                className="form-control"
                style={{ maxWidth: 180 }}
                value={roleSelect}
                onChange={(e) => setRoleSelect(e.target.value)}
              >
                <option value="all">Tất cả vai trò</option>
                <option value="admin">Quản trị viên (Admin)</option>
                <option value="teacher">Giảng viên (Teacher)</option>
                <option value="student">Học viên (Student)</option>
              </select>
            )}
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Họ và tên</th>
                  <th>Email</th>
                  <th>Vai trò</th>
                  <th>Ngày tham gia</th>
                  <th style={{ textAlign: 'right' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {allUsers === null && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      Đang tải danh sách người dùng...
                    </td>
                  </tr>
                )}
                {allUsers !== null && filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      Không tìm thấy người dùng phù hợp.
                    </td>
                  </tr>
                )}
                {filtered.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="avatar avatar-sm" style={{ background: 'var(--primary)', fontSize: '0.75rem' }}>
                          {rowInitials(u.fullname)}
                        </div>
                        <strong style={{ color: 'var(--secondary)' }}>{u.fullname}</strong>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`badge ${roleBadgeClass(u.role)}`}>{u.role}</span>
                    </td>
                    <td>{u.created_at ? u.created_at.split(' ')[0] : '—'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-outline btn-sm"
                        style={{ padding: '0.25rem 0.5rem', marginRight: '0.25rem' }}
                        onClick={() => openEditModal(u)}
                      >
                        Sửa
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.5rem', background: 'var(--danger)' }}
                        onClick={() => handleDelete(u.id)}
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
            <h3>{isEditing ? 'Cập nhật người dùng' : 'Thêm người dùng mới'}</h3>
            <button className="btn-icon" onClick={() => setModalOpen(false)}>
              ✕
            </button>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Họ và tên</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  placeholder="Nguyễn Văn A"
                  value={form.fullname}
                  onChange={(e) => setForm({ ...form, fullname: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  required
                  placeholder="example@gmail.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              {/* Mật khẩu chỉ có ý nghĩa khi tạo mới — bản gốc ẩn nhóm này (và bỏ required) khi sửa. */}
              {!isEditing && (
                <div className="form-group">
                  <label className="form-label">Mật khẩu</label>
                  <input
                    type="password"
                    className="form-control"
                    required
                    placeholder="Tối thiểu 6 ký tự"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Vai trò</label>
                <select
                  className="form-control"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="student">Student (Học viên)</option>
                  <option value="teacher">Teacher (Giảng viên)</option>
                  <option value="admin">Admin (Quản trị)</option>
                </select>
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
