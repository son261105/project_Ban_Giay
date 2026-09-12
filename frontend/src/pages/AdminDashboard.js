import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboardStats } from '../services/api';

const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

export const AdminLayout = ({ children }) => {
  const { logoutUser } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => { logoutUser(); navigate('/'); };

  const navItems = [
    { path: '/admin', label: ' Dashboard', exact: true },
    { path: '/admin/products', label: ' Sản phẩm' },
    { path: '/admin/brands', label: ' Thương hiệu' },
    { path: '/admin/categories', label: ' Danh mục' },
    { path: '/admin/inventory', label: ' Kho hàng' },
    { path: '/admin/orders', label: ' Đơn hàng' },
    { path: '/admin/users', label: ' Người dùng' },
    { path: '/admin/reports', label: ' Báo cáo' },
    { path: '/admin/vouchers', label: ' Voucher' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Sidebar */}
      <div style={{ width: 240, background: '#111', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 100 }}>
        <Link to="/" style={{ display: 'block', padding: '24px 24px 16px', textDecoration: 'none' }}>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 28, color: '#fff', letterSpacing: 2 }}>
            KICK<span style={{ color: 'var(--accent)' }}>ZONE</span>
          </div>
          <div style={{ fontSize: 11, color: '#888', marginTop: 2, letterSpacing: 1, textTransform: 'uppercase' }}>Admin Panel</div>
        </Link>
        <nav style={{ flex: 1, padding: '8px 12px' }}>
          {navItems.map(item => {
            const active = item.exact ? pathname === item.path : pathname.startsWith(item.path);
            return (
              <Link key={item.path} to={item.path} style={{
                display: 'block', padding: '12px 16px', borderRadius: 10, marginBottom: 4,
                textDecoration: 'none', fontSize: 14, fontWeight: active ? 700 : 400,
                background: active ? 'var(--accent)' : 'transparent',
                color: active ? '#fff' : '#aaa',
                transition: 'all 0.2s',
              }}>{item.label}</Link>
            );
          })}
        </nav>
        <div style={{ padding: 16 }}>
          <Link to="/" style={{ display: 'block', padding: '10px 16px', color: '#aaa', fontSize: 13, textDecoration: 'none', marginBottom: 8, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, textAlign: 'center' }}>
  Về trang chủ
</Link>
          <button onClick={handleLogout} style={{ width: '100%', padding: '10px 16px', background: 'rgba(255,255,255,0.05)',
            color: '#aaa', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>
             Đăng xuất
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, marginLeft: 240, padding: 32, minHeight: '100vh' }}>
        {children}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(r => { setStats(r.data.stats); setRecentOrders(r.data.recentOrders); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statusColors = {
    pending: '#FFF8E1', confirmed: '#E3F2FD', shipping: '#E8F5E9',
    delivered: '#E8F5E9', cancelled: '#FFEBEE'
  };
  const statusLabels = {
    pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận', shipping: 'Đang giao',
    delivered: 'Đã giao', cancelled: 'Đã hủy'
  };

  return (
    <AdminLayout>
      <div className="page-header">
        <h1 className="page-title">DASHBOARD</h1>
      </div>

      {loading ? <div className="loading"><div className="spinner"></div></div> : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
            {[
              { label: 'Tổng đơn hàng', value: stats?.totalOrders || 0, icon: '', color: '#E3F2FD' },
              { label: 'Doanh thu', value: formatPrice(stats?.totalRevenue || 0), icon: '', color: '#E8F5E9' },
              { label: 'Đơn chờ', value: stats?.pendingOrders || 0, icon: '', color: '#FFF8E1' },
            ].map(card => (
              <div key={card.label} style={{ background: card.color, borderRadius: 16, padding: 24 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{card.icon}</div>
                <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Bebas Neue, sans-serif' }}>{card.value}</div>
                <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>{card.label}</div>
              </div>
            ))}
          </div>

          <h2 style={{ fontSize: 22, marginBottom: 16 }}>ĐƠN HÀNG GẦN ĐÂY</h2>
          <div className="table-container">
            <table>
              <thead><tr><th>ID</th><th>Khách hàng</th><th>Tổng tiền</th><th>Trạng thái</th><th>Ngày tạo</th></tr></thead>
              <tbody>
                {recentOrders.map(o => (
                  <tr key={o.id}>
                    <td style={{ color: '#888', fontWeight: 600 }}>#{o.id}</td>
                    <td style={{ fontWeight: 600 }}>{o.user_name || o.user_email}</td>
                    <td style={{ fontWeight: 600, color: 'var(--accent)' }}>{formatPrice(o.total_amount)}</td>
                    <td><span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                      background: statusColors[o.status] || '#f0f0f0' }}>{statusLabels[o.status] || o.status}</span></td>
                    <td style={{ color: '#888', fontSize: 13 }}>{new Date(o.created_at).toLocaleDateString('vi-VN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {recentOrders.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>Chưa có đơn hàng</div>}
          </div>
        </>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
