import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMyOrderById, cancelMyOrder } from '../services/api';

const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p || 0);
const formatDateTime = (d) => new Date(d).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const formatDate = (d) => new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

const statusLabels = { pending: 'Chờ xác nhận', confirmed: 'Đang xử lý', shipping: 'Đang giao', delivered: 'Đã giao', cancelled: 'Đã hủy' };

const STEPS = [
  { key: 'pending', label: 'Đã đặt hàng' },
  { key: 'confirmed', label: 'Đã xác nhận' },
  { key: 'shipping', label: 'Đang giao' },
  { key: 'delivered', label: 'Đã giao' },
];

const SHIPPING_FEE = 35000;

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const load = () => {
    getMyOrderById(id)
      .then(r => setOrder(r.data.order))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleCancel = async () => {
    setConfirmOpen(false);
    setCancelling(true);
    try {
      await cancelMyOrder(id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Hủy đơn hàng thất bại');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;
  if (!order) return (
    <div className="container page">
      <div className="empty-state">
        <p>Không tìm thấy đơn hàng</p>
        <button className="btn btn-primary" onClick={() => navigate('/orders')}>Quay lại danh sách</button>
      </div>
    </div>
  );

  const history = order.history || [];
  const findStepTime = (statusKey) => history.find(h => h.status === statusKey)?.changed_at;
  const currentStepIndex = STEPS.findIndex(s => s.key === order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="container page" style={{ maxWidth: 700 }}>
      {confirmOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: 28, maxWidth: 380, width: '90%', textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Hủy đơn hàng?</h3>
            <p style={{ color: '#666', fontSize: 14, marginBottom: 24 }}>Hành động này không thể hoàn tác.</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => setConfirmOpen(false)} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid #ddd', background: 'white', cursor: 'pointer', fontWeight: 600 }}>
                Không, giữ đơn
              </button>
              <button onClick={handleCancel} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: '#c62828', color: 'white', cursor: 'pointer', fontWeight: 600 }}>
                Hủy đơn hàng
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ background: 'white', borderRadius: 16, padding: 28, boxShadow: 'var(--shadow)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Chi tiết đơn hàng #DH{String(order.id).padStart(3, '0')}</h1>
            <div style={{ color: '#888', fontSize: 13, marginTop: 4 }}>Đặt ngày {formatDate(order.created_at)}</div>
          </div>
          <span className={`badge badge-${order.status}`}>{statusLabels[order.status]}</span>
        </div>

        <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid var(--border)' }} />

        <h3 style={{ fontSize: 14, marginBottom: 16 }}>Trạng thái đơn hàng</h3>
        {isCancelled ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#c62828', fontWeight: 600 }}>
            ✕ Đơn hàng đã bị hủy
            {findStepTime('cancelled') && (
              <span style={{ color: '#888', fontWeight: 400, fontSize: 13 }}>· {formatDateTime(findStepTime('cancelled'))}</span>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 12 }}>
            {STEPS.map((step, i) => {
              const done = i <= currentStepIndex;
              const time = findStepTime(step.key);
              return (
                <div key={step.key} style={{ flex: 1, minWidth: 120, textAlign: 'center' }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', margin: '0 auto 8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: done ? 'var(--primary)' : '#eee',
                    color: done ? 'white' : '#aaa', fontWeight: 700, fontSize: 13
                  }}>
                    {done ? '✓' : i + 1}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: done ? '#111' : '#aaa' }}>{step.label}</div>
                  <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                    {done ? (time ? formatDateTime(time) : '') : 'Chưa hoàn tất'}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid var(--border)' }} />

        <h3 style={{ fontSize: 14, marginBottom: 12 }}>Thông tin nhận hàng</h3>
        <div style={{ background: '#f9f9f9', borderRadius: 10, padding: 16 }}>
          <div style={{ fontWeight: 700 }}>{order.user_name || order.user_email}</div>
          <div style={{ color: '#555', marginTop: 4 }}>{order.phone}</div>
          <div style={{ color: '#555', marginTop: 4 }}>{order.shipping_address}</div>
          {order.note && <div style={{ color: '#888', marginTop: 8, fontSize: 13 }}>Ghi chú: {order.note}</div>}
        </div>

        <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid var(--border)' }} />

        <h3 style={{ fontSize: 14, marginBottom: 12 }}>Sản phẩm trong đơn hàng</h3>
        {(order.items || []).map(item => (
          <div key={item.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
            <img
              src={item.product_image}
              alt={item.product_name}
              style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }}
              onError={e => { e.target.src = 'https://via.placeholder.com/56?text=?'; }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{item.product_name}</div>
              <div style={{ color: '#888', fontSize: 13 }}>Size {item.size} · SL: {item.quantity}</div>
            </div>
            <div style={{ fontWeight: 600 }}>{formatPrice(item.price)}</div>
          </div>
        ))}

        <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid var(--border)' }} />

        <h3 style={{ fontSize: 14, marginBottom: 12 }}>Thanh toán</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: '#555' }}>
          <span>Tạm tính</span><span>{formatPrice(order.subtotal_amount)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: '#555' }}>
          <span>Phí vận chuyển</span><span>{formatPrice(SHIPPING_FEE)}</span>
        </div>
        {order.discount_amount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: '#2E7D32' }}>
            <span>Giảm giá {order.voucher_code ? `(${order.voucher_code})` : ''}</span><span>-{formatPrice(order.discount_amount)}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 17, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
          <span>Tổng cộng</span><span>{formatPrice(order.total_amount)}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 28 }}>
          <button className="btn btn-outline" onClick={() => navigate('/orders')}>Quay lại</button>
          {order.status === 'pending' && (
            <button className="btn btn-danger" disabled={cancelling} onClick={() => setConfirmOpen(true)}>
              {cancelling ? 'Đang hủy...' : 'Hủy đơn hàng'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;