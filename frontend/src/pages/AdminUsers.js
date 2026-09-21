import React, { useEffect, useState } from 'react';
import { AdminLayout } from './AdminDashboard';
import { getAllUsers, toggleUserStatus, getUserOrderSummary } from '../services/api';
import { useAuth } from '../context/AuthContext';

const formatDate = (d) => new Date(d).toLocaleDateString('vi-VN');
const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p || 0);
const orderStatusLabels = { pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận', shipping: 'Đang giao', delivered: 'Đã giao', cancelled: 'Đã hủy' };

const formatPhone = (phone) => phone || '—';

const PAGE_SIZE = 10;

const StatusBadge = ({ status }) => (
  <span style={{
    padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600,
    background: status === 'locked' ? '#FFEBEE' : '#E8F5E9',
    color: status === 'locked' ? '#c62828' : '#2E7D32',
  }}>
    {status === 'locked' ? 'Bị khóa' : 'Hoạt động'}
  </span>
);

const RoleBadge = ({ role }) => (
  <span style={{
    padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600,
    background: role === 'admin' ? '#FFF3E0' : '#E3F2FD',
    color: role === 'admin' ? '#E65100' : '#1565C0',
  }}>
    {role === 'admin' ? 'Admin' : 'Customer'}
  </span>
);

const Avatar = ({ name, role, size = 36 }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%',
    background: role === 'admin' ? 'var(--accent)' : 'var(--primary)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'white', fontWeight: 600, fontSize: size * 0.4, flexShrink: 0
  }}>
    {name?.charAt(0)?.toUpperCase() || '?'}
  </div>
);

// ===== Modal Chi tiết người dùng =====
const UserDetailModal = ({ user, onClose }) => {
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  useEffect(() => {
    setLoadingSummary(true);
    getUserOrderSummary(user.id)
      .then(r => setSummary(r.data))
      .catch(() => setSummary({ totalOrders: 0, totalSpent: 0, recentOrders: [] }))
      .finally(() => setLoadingSummary(false));
  }, [user.id]);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }} onClick={onClose}>
      <div
        style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: 560, maxHeight: '85vh', overflowY: 'auto', padding: 28 }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 21 }}>Chi tiết người dùng</h2>
            <p style={{ margin: '4px 0 0', color: '#888', fontSize: 14 }}>Thông tin tài khoản và lịch sử mua hàng</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 21, cursor: 'pointer', color: '#888' }}>✕</button>
        </div>

        <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid var(--border)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Avatar name={user.name} role={user.role} size={56} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 18 }}>{user.name}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <RoleBadge role={user.role} />
              <StatusBadge status={user.status} />
            </div>
          </div>
        </div>

        <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid var(--border)' }} />

        <h3 style={{ fontSize: 15, marginBottom: 14 }}>Thông tin tài khoản</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <div style={{ color: '#888', fontSize: 14 }}>Mã người dùng</div>
            <div style={{ fontWeight: 600 }}>KH{String(user.id).padStart(3, '0')}</div>
          </div>
          <div>
            <div style={{ color: '#888', fontSize: 14 }}>Họ và tên</div>
            <div style={{ fontWeight: 600 }}>{user.name}</div>
          </div>
          <div>
            <div style={{ color: '#888', fontSize: 14 }}>Email</div>
            <div style={{ fontWeight: 600 }}>{user.email}</div>
          </div>
          <div>
            <div style={{ color: '#888', fontSize: 14 }}>Số điện thoại</div>
            <div style={{ fontWeight: 600 }}>{formatPhone(user.phone)}</div>          </div>
          <div>
            <div style={{ color: '#888', fontSize: 14 }}>Ngày đăng ký</div>
            <div style={{ fontWeight: 600 }}>{formatDate(user.created_at)}</div>
          </div>
          <div>
            <div style={{ color: '#888', fontSize: 14 }}>Trạng thái</div>
            <div style={{ marginTop: 2 }}><StatusBadge status={user.status} /></div>
          </div>
        </div>

        <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid var(--border)' }} />

        <h3 style={{ fontSize: 15, marginBottom: 14 }}>Thông tin mua hàng</h3>
        {loadingSummary ? (
          <div style={{ color: '#888', fontSize: 15 }}>Đang tải...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <div style={{ color: '#888', fontSize: 14 }}>Tổng số đơn hàng</div>
              <div style={{ fontWeight: 600, fontSize: 19 }}>{summary.totalOrders} đơn</div>
            </div>
            <div>
              <div style={{ color: '#888', fontSize: 14 }}>Tổng chi tiêu</div>
              <div style={{ fontWeight: 600, fontSize: 19 }}>{formatPrice(summary.totalSpent)}</div>
            </div>
          </div>
        )}

        <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid var(--border)' }} />

        <h3 style={{ fontSize: 15, marginBottom: 14 }}>Đơn hàng gần đây</h3>
        {!loadingSummary && summary.recentOrders.length === 0 && (
          <div style={{ color: '#888', fontSize: 15 }}>Chưa có đơn hàng nào.</div>
        )}
        {!loadingSummary && summary.recentOrders.length > 0 && (
          <table style={{ width: '100%', fontSize: 15 }}>
            <thead>
              <tr style={{ color: '#888', textAlign: 'left' }}>
                <th style={{ paddingBottom: 8 }}>Mã đơn</th>
                <th style={{ paddingBottom: 8 }}>Ngày đặt</th>
                <th style={{ paddingBottom: 8 }}>Tổng tiền</th>
                <th style={{ paddingBottom: 8 }}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {summary.recentOrders.map(o => (
                <tr key={o.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '8px 0', color: '#1565C0', fontWeight: 600 }}>#DH{String(o.id).padStart(3, '0')}</td>
                  <td style={{ padding: '8px 0' }}>{formatDate(o.created_at)}</td>
                  <td style={{ padding: '8px 0' }}>{formatPrice(o.total_amount)}</td>
                  <td style={{ padding: '8px 0' }}>
                    <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{orderStatusLabels[o.status] || o.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
          <button className="btn btn-outline" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
};

// ===== Trang chính Quản lý người dùng =====
const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [msg, setMsg] = useState('');
  const [detailUser, setDetailUser] = useState(null);
  const { user: currentUser } = useAuth();

  const fetchUsers = () => {
    getAllUsers()
      .then(r => setUsers(r.data.users))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleToggleStatus = async (u) => {
    const action = u.status === 'locked' ? 'mở khóa' : 'khóa';
    if (!window.confirm(`Bạn chắc chắn muốn ${action} tài khoản "${u.name}"?`)) return;
    try {
      const res = await toggleUserStatus(u.id);
      setUsers(users.map(x => x.id === u.id ? { ...x, status: res.data.status } : x));
      setMsg('✅ ' + res.data.message);
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.message || 'Lỗi khi cập nhật trạng thái'));
    }
  };

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.phone || '').includes(q);
    const matchesRole = !roleFilter || u.role === roleFilter;
    const matchesStatus = !statusFilter || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search, roleFilter, statusFilter]);

  return (
    <AdminLayout>
      <div className="page-header">
        <h1 className="page-title">QUẢN LÝ NGƯỜI DÙNG</h1>
        <span style={{ background: '#f0f0f0', padding: '6px 16px', borderRadius: 20, fontWeight: 600, fontSize: 15 }}>
          Tổng: {users.length} tài khoản
        </span>
      </div>

      {msg && (
        <div style={{
          padding: '12px 16px', borderRadius: 10, marginBottom: 20, fontSize: 15,
          background: msg.startsWith('✅') ? '#E8F5E9' : '#FFEBEE',
          color: msg.startsWith('✅') ? '#2E7D32' : '#c62828'
        }}>{msg}</div>
      )}

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          placeholder="🔍 Tìm theo tên, email, SĐT..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: '10px 16px', border: '2px solid var(--border)', borderRadius: 10, fontSize: 15, width: 280 }}
        />
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          style={{ padding: '10px 16px', border: '2px solid var(--border)', borderRadius: 10, fontSize: 15 }}
        >
          <option value="">Vai trò: Tất cả</option>
          <option value="user">Customer</option>
          <option value="admin">Admin</option>
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: '10px 16px', border: '2px solid var(--border)', borderRadius: 10, fontSize: 15 }}
        >
          <option value="">Trạng thái: Tất cả</option>
          <option value="active">Hoạt động</option>
          <option value="locked">Bị khóa</option>
        </select>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner"></div></div>
      ) : (
        <div className="table-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 4px 12px' }}>
            <span style={{ fontWeight: 600 }}>Danh sách người dùng</span>
            <span style={{ color: '#888', fontSize: 14 }}>
              Hiển thị {filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} trong {filtered.length} người dùng
            </span>
          </div>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Người dùng</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paged.map(u => (
                <tr key={u.id}>
                  <td style={{ color: '#888', fontWeight: 600 }}>{String(u.id).padStart(3, '0')}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={u.name} role={u.role} />
                      <div>
                        <div style={{ fontWeight: 600 }}>{u.name}</div>
                        <div style={{ color: '#888', fontSize: 13 }}>Đăng ký {formatDate(u.created_at)}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: '#555' }}>{u.email}</td>
                  <td style={{ color: '#888' }}>{formatPhone(u.phone)}</td>                  <td><RoleBadge role={u.role} /></td>
                  <td><StatusBadge status={u.status} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        title="Xem chi tiết"
                        onClick={() => setDetailUser(u)}
                        style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }}
                      >👁</button>
                      {u.id === currentUser?.id || u.role === 'admin' ? (
                        <span title="Không thể khóa admin" style={{ padding: '6px 10px', color: '#ccc' }}>🔒</span>
                      ) : (
                        <button
                          title={u.status === 'locked' ? 'Mở khóa' : 'Khóa tài khoản'}
                          onClick={() => handleToggleStatus(u)}
                          style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }}
                        >{u.status === 'locked' ? '🔓' : '🔒'}</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>Không tìm thấy người dùng nào</div>}

          {filtered.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 4px 4px' }}>
              <span style={{ color: '#888', fontSize: 14 }}>{PAGE_SIZE} người dùng / trang</span>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <button className="btn btn-sm btn-outline" disabled={currentPage === 1} onClick={() => setPage(p => p - 1)}>‹</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    className={`btn btn-sm ${p === currentPage ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setPage(p)}
                  >{p}</button>
                ))}
                <button className="btn btn-sm btn-outline" disabled={currentPage === totalPages} onClick={() => setPage(p => p + 1)}>›</button>
              </div>
            </div>
          )}
        </div>
      )}

      {detailUser && <UserDetailModal user={detailUser} onClose={() => setDetailUser(null)} />}
    </AdminLayout>
  );
};

export default AdminUsers;