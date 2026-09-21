import React from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderId = location.state?.orderId;

  if (!orderId) return <Navigate to="/orders" replace />;

  return (
    <div className="container page" style={{ display: 'flex', justifyContent: 'center' }}>
      <div style={{
        background: 'white', borderRadius: 20, padding: '56px 48px', maxWidth: 520,
        width: '100%', textAlign: 'center', boxShadow: 'var(--shadow)', marginTop: 40
      }}>
        <div style={{
          width: 88, height: 88, borderRadius: '50%', background: '#E8F5E9',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px'
        }}>
          <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>

        <h1 style={{ fontSize: 25, fontWeight: 600, marginBottom: 8 }}>Đặt hàng thành công</h1>
        <p style={{ color: '#666', fontSize: 16, marginBottom: 4 }}>
          Cảm ơn bạn đã mua sắm tại DS Sport.        </p>
        <p style={{ color: '#666', fontSize: 16, marginBottom: 32 }}>
          Mã đơn hàng: <strong style={{ color: '#111' }}>#{orderId}</strong>
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-outline" onClick={() => navigate('/products')}>
            Tiếp tục mua sắm
          </button>
          <button className="btn btn-accent" onClick={() => navigate('/orders')}>
            Xem đơn hàng của tôi
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
