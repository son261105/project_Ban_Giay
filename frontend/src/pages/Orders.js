import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getUserOrders, cancelMyOrder } from '../services/api';

const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);
const formatDate = (d) => new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const statusLabels = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy'
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const loadOrders = () => {
    getUserOrders()
      .then(r => setOrders(r.data.orders))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadOrders(); }, []);

  
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

    return (
    <>
      {confirmId && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: 'white', borderRadius: 16, padding: 28, maxWidth: 380, width: '90%', textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Hủy đơn hàng?</h3>
            <p style={{ color: '#666', fontSize: 14, marginBottom: 24 }}>
              Bạn chắc chắn muốn hủy đơn hàng #{confirmId} này? Hành động này không thể hoàn tác.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                onClick={() => setConfirmId(null)}
                style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid #ddd', background: 'white', cursor: 'pointer', fontWeight: 600 }}
              >
                Không, giữ đơn
              </button>
              <button
                onClick={confirmCancel}
                style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: '#c62828', color: 'white', cursor: 'pointer', fontWeight: 600 }}
              >
                Hủy đơn hàng
              </button>
            </div>
          </div>
        </div>
      )}
    <div className="container page">
      

      <h1 className="page-title" style={{ marginBottom: 32 }}>ĐƠN HÀNG CỦA TÔI</h1>

      {orders.length === 0 ? (
        <div className="empty-state">
          <h2>📦</h2>
          <p>Bạn chưa có đơn hàng nào</p>
          <button className="btn btn-primary" onClick={() => navigate('/products')}>Mua sắm ngay</button>
        </div>
      ) : (
        <div>
          {orders.map(order => (
            <div key={order.id} style={{ background: 'white', borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: 'var(--shadow)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                               <div>
                  <span style={{ fontWeight: 700, fontSize: 16 }}>Đơn #{order.id}</span>
                  <span style={{ color: '#888', fontSize: 13, marginLeft: 12 }}>{formatDate(order.created_at)}</span>
                  {order.status === 'pending' && (
                    <button
                      onClick={() => handleCancel(order.id)}
                      disabled={cancellingId === order.id}
                      style={{ marginLeft: 16, background: 'none', border: '1px solid #c62828', color: '#c62828', borderRadius: 8, padding: '4px 12px', fontSize: 13, cursor: 'pointer' }}
                    >
                      {cancellingId === order.id ? 'Đang hủy...' : 'Hủy đơn'}
                    </button>
                  )}
                </div>
                <span className={`badge badge-${order.status}`}>{statusLabels[order.status]}</span>
              </div>

              <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                {(order.items || []).map(item => (
                  <div key={item.id} style={{ display: 'flex', gap: 10, alignItems: 'center', background: '#f9f9f9', borderRadius: 10, padding: '8px 12px' }}>
                    <img
                      src={item.product_image}
                      alt={item.product_name}
                      style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }}
                      onError={e => { e.target.src = 'https://via.placeholder.com/48?text=?'; }}
                    />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{item.name}</div>
                      <div style={{ fontSize: 12, color: '#888' }}>x{item.quantity} {item.size && `· Size ${item.size}`}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid var(--border)', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ fontSize: 13, color: '#666' }}>
                  📍 {order.shipping_address}
                </div>
                <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--accent)' }}>
                  {formatPrice(order.total_amount)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
        </div>
    </>
  );
};

export default Orders;
