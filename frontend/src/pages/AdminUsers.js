import React, { useEffect, useState } from 'react';
import { AdminLayout } from './AdminDashboard';
import { getAllUsers, deleteUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

const formatDate = (d) => new Date(d).toLocaleDateString('vi-VN');

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [msg, setMsg] = useState('');
  const { user: currentUser } = useAuth();

  const fetchUsers = () => {
    getAllUsers()
      .then(r => setUsers(r.data.users))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Xóa người dùng "${name}"? Thao tác này không thể hoàn tác.`)) return;
    try {
      await deleteUser(id);
      setMsg('✅ Đã xóa người dùng!');
      fetchUsers();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.message || 'Lỗi khi xóa'));
    }
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="page-header">
        <h1 className="page-title">QUẢN LÝ NGƯỜI DÙNG</h1>
        <span style={{ background: '#f0f0f0', padding: '6px 16px', borderRadius: 20, fontWeight: 600, fontSize: 14 }}>
          Tổng: {users.length} tài khoản
        </span>
      </div>

      {msg && (
        <div style={{
          padding: '12px 16px', borderRadius: 10, marginBottom: 20, fontSize: 14,
          background: msg.startsWith('✅') ? '#E8F5E9' : '#FFEBEE',
          color: msg.startsWith('✅') ? '#2E7D32' : '#c62828'
        }}>{msg}</div>
      )}

      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="🔍 Tìm theo tên hoặc email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: '10px 16px', border: '2px solid var(--border)', borderRadius: 10, fontSize: 14, width: 320 }}
        />
      </div>

      {loading ? (
        <div className="loading"><div className="spinner"></div></div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Vai trò</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td style={{ color: '#888', fontWeight: 600 }}>#{u.id}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%', background: u.role === 'admin' ? 'var(--accent)' : 'var(--primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: 700, fontSize: 14, flexShrink: 0
                      }}>
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600 }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ color: '#555' }}>{u.email}</td>
                  <td style={{ color: '#888' }}>{u.phone || '—'}</td>
                  <td>
                    <span style={{
                      padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                      background: u.role === 'admin' ? '#FFF3E0' : '#E3F2FD',
                      color: u.role === 'admin' ? '#E65100' : '#1565C0',
                      textTransform: 'uppercase', letterSpacing: '0.05em'
                    }}>
                      {u.role === 'admin' ? '👑 Admin' : '👤 User'}
                    </span>
                  </td>
                  <td style={{ color: '#888', fontSize: 13 }}>{formatDate(u.created_at)}</td>
                  <td>
                    {u.id === currentUser?.id ? (
                      <span style={{ fontSize: 13, color: '#888' }}>Tài khoản của bạn</span>
                    ) : (
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id, u.name)}>
                        🗑 Xóa
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>Không tìm thấy người dùng nào</div>}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminUsers;
