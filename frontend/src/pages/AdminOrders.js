import React, { useEffect, useState } from 'react';
import { AdminLayout } from './AdminDashboard';
import { getAllOrders, updateOrderStatus } from '../services/api';

const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);
const formatDate = (d) => new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const statusLabels = { pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận', shipping: 'Đang giao', delivered: 'Đã giao', cancelled: 'Đã hủy' };

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [msg, setMsg] = useState('');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    getAllOrders()
      .then(r => setOrders(r.data.orders))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const handleStatus = async (id, status) => {
    try {
      await updateOrderStatus(id, status);
      setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
      setMsg('✅ Cập nhật trạng thái thành công!');
      setTimeout(() => setMsg(''), 3000);
    } catch { setMsg('❌ Lỗi khi cập nhật'); }
  };

  const filtered = filterStatus ? orders.filter(o => o.status === filterStatus) : orders;

  return (
    <AdminLayout>
      <div className="page-header">
        <h1 className="page-title">QUẢN LÝ ĐƠN HÀNG</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          {['', 'pending', 'confirmed', 'shipping', 'delivered', 'cancelled'].map(s => (
            <button
              key={s}
              className={`btn btn-sm ${filterStatus === s ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilterStatus(s)}>
              {s ? statusLabels[s] : 'Tất cả'}
            </button>
          ))}
        </div>
      </div>

      {msg && (
        <div style={{
          padding: '12px 16px', borderRadius: 10, marginBottom: 20, fontSize: 14,
          background: msg.startsWith('✅') ? '#E8F5E9' : '#FFEBEE',
          color: msg.startsWith('✅') ? '#2E7D32' : '#c62828'
        }}>{msg}</div>
      )}

      {loading ? (
        <div className="loading"><div className="spinner"></div></div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Mã ĐH</th>
                <th>Khách hàng</th>
                <th>Số điện thoại</th>
                <th>Tổng tiền</th>
                <th>Ngày đặt</th>
                <th>Trạng thái</th>
                <th>Cập nhật</th>
                <th>Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => (
                <React.Fragment key={order.id}>
                  <tr>
                    <td style={{ fontWeight: 700 }}>#{order.id}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{order.user_name}</div>
                      <div style={{ fontSize: 12, color: '#888' }}>{order.user_email}</div>
                    </td>
                    <td>{order.phone}</td>
                    <td style={{ fontWeight: 700, color: 'var(--accent)' }}>{formatPrice(order.total_amount)}</td>
                    <td style={{ fontSize: 13, color: '#888' }}>{formatDate(order.created_at)}</td>
                    <td><span className={`badge badge-${order.status}`}>{statusLabels[order.status]}</span></td>
                    <td>
                      <select
                        value={order.status}
                        onChange={e => handleStatus(order.id, e.target.value)}
                        style={{ padding: '6px 10px', border: '2px solid var(--border)', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>
                        {Object.entries(statusLabels).map(([k, v]) => (
                          <option key={k} value={k}>{v}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
                        {expanded === order.id ? '▲ Thu gọn' : '▼ Xem'}
                      </button>
                    </td>
                  </tr>
                  {expanded === order.id && (
                    <tr>
                      <td colSpan={8} style={{ background: '#f9f9f9', padding: '16px 20px' }}>
                        <div style={{ fontSize: 13, marginBottom: 8, color: '#555' }}>
                          <strong>Địa chỉ:</strong> {order.shipping_address}
                        </div>
                        {order.note && <div style={{ fontSize: 13, marginBottom: 8, color: '#555' }}><strong>Ghi chú:</strong> {order.note}</div>}
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                          {(order.items || []).map(item => (
                            <div key={item.id} style={{ display: 'flex', gap: 10, alignItems: 'center', background: 'white', borderRadius: 10, padding: '8px 12px', border: '1px solid var(--border)' }}>
                              <img src={item.product_image} alt={item.product_name} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }}
                                onError={e => { e.target.src = 'https://via.placeholder.com/40?text=?'; }} />
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 600 }}>{item.name}</div>
                                <div style={{ fontSize: 12, color: '#888' }}>Size {item.size} · x{item.quantity} · {formatPrice(item.price)}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>Không có đơn hàng nào</div>}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminOrders;
