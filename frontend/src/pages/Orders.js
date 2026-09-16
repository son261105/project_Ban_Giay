import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserOrders, cancelMyOrder } from '../services/api';

const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);
const formatDate = (d) => new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

const statusLabels = { pending: 'Chờ xác nhận', confirmed: 'Đang xử lý', shipping: 'Đang giao', delivered: 'Đã giao', cancelled: 'Đã hủy' };

const TABS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending', label: 'Chờ xác nhận' },
  { key: 'confirmed', label: 'Đang xử lý' },
  { key: 'shipping', label: 'Đang giao' },
  { key: 'delivered', label: 'Đã giao' },
  { key: 'cancelled', label: 'Đã hủy' },
];

const PAGE_SIZE = 5;

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [page, setPage] = useState(1);
  const [cancellingId, setCancellingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const navigate = useNavigate();

  const loadOrders = () => {
    getUserOrders()
      .then(r => setOrders(r.data.orders))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadOrders(); }, []);
  useEffect(() => { setPage(1); }, [tab]);

  const handleCancel = (id) => setConfirmId(id);

  const confirmCancel = async () => {
    const id = confirmId;
    setConfirmId(null);
    setCancellingId(id);
    try {
      await cancelMyOrder(id);
      loadOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Hủy đơn hàng thất bại');
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  const filtered = tab === 'all' ? orders : orders.filter(o => o.status === tab);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <>
      {confirmId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: 28, maxWidth: 380, width: '90%', textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Hủy đơn hàng?</h3>
            <p style={{ color: '#666', fontSize: 14, marginBottom: 24 }}>
              Bạn chắc chắn muốn hủy đơn hàng #{confirmId} này? Hành động này không thể hoàn tác.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => setConfirmId(null)} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid #ddd', background: 'white', cursor: 'pointer', fontWeight: 600 }}>
                Không, giữ đơn
              </button>
              <button onClick={confirmCancel} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: '#c62828', color: 'white', cursor: 'pointer', fontWeight: 600 }}>
                Hủy đơn hàng
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container page">
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>Đơn hàng của tôi</h1>
        <p style={{ color: '#888', marginBottom: 24 }}>Quản lý và theo dõi các đơn hàng bạn đã đặt</p>

        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: '8px 16px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600,
                background: tab === t.key ? '#eee' : 'transparent',
                color: tab === t.key ? '#111' : '#888'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <h2>📦</h2>
            <p>Không có đơn hàng nào</p>
            <button className="btn btn-primary" onClick={() => navigate('/products')}>Mua sắm ngay</button>
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: 16, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
            {paged.map((order, idx) => {
              const firstItem = (order.items || [])[0];
              const extraCount = (order.items || []).length - 1;
              return (
                <div key={order.id} style={{ padding: 24, borderBottom: idx < paged.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontWeight: 700, fontSize: 16 }}>Đơn hàng #DH{String(order.id).padStart(3, '0')}</span>
                        <span className={`badge badge-${order.status}`}>{statusLabels[order.status]}</span>
                      </div>
                      <div style={{ color: '#888', fontSize: 13, marginTop: 4 }}>Đặt ngày {formatDate(order.created_at)}</div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 18 }}>{formatPrice(order.total_amount)}</div>
                  </div>

                  {firstItem && (
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
                      <img
                        src={firstItem.product_image}
                        alt={firstItem.product_name}
                        style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }}
                        onError={e => { e.target.src = 'https://via.placeholder.com/64?text=?'; }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600 }}>{firstItem.product_name}</div>
                        <div style={{ color: '#888', fontSize: 13 }}>
                          Size {firstItem.size} · SL: {firstItem.quantity}
                        </div>
                        <div style={{ color: '#555', fontSize: 13 }}>{formatPrice(firstItem.price)}</div>
                      </div>
                      {extraCount > 0 && (
                        <div style={{ color: '#1565C0', fontSize: 13, fontWeight: 600 }}>+{extraCount} sản phẩm</div>
                      )}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid var(--border)', flexWrap: 'wrap', gap: 10 }}>
                    <div style={{ fontSize: 13, color: '#666' }}>Thanh toán: COD</div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleCancel(order.id)}
                          disabled={cancellingId === order.id}
                          className="btn btn-outline btn-sm"
                        >
                          {cancellingId === order.id ? 'Đang hủy...' : 'Hủy đơn'}
                        </button>
                      )}
                      <button className="btn btn-outline btn-sm" onClick={() => navigate(`/orders/${order.id}`)}>
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: 20 }}>
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
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Orders;