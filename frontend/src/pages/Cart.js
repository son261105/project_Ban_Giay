import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCart, updateCartItem, removeFromCart } from '../services/api';
import { useCart } from '../context/CartContext';

const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const { refreshCart } = useCart();
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const res = await getCart();
      setCart(res.data.cart);
    } catch { setCart([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCart(); }, []);

  const handleQty = async (item, delta) => {
    const newQty = item.quantity + delta;
    try {
      await updateCartItem(item.id, { quantity: newQty });
      await fetchCart();
      await refreshCart();
    } catch {}
  };

  const handleRemove = async (id) => {
    try {
      await removeFromCart(id);
      await fetchCart();
      await refreshCart();
    } catch {}
  };

  const total = cart.reduce((sum, i) => sum + i.product_price * i.quantity, 0);

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div className="container page">
      <h1 className="page-title" style={{ marginBottom: 32 }}>GIỎ HÀNG ({cart.length} sản phẩm)</h1>

      {cart.length === 0 ? (
        <div className="empty-state">
          <h2>🛒</h2>
          <p>Giỏ hàng của bạn đang trống</p>
          <button className="btn btn-primary" onClick={() => navigate('/products')}>Mua sắm ngay</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32, alignItems: 'start' }}>
          {/* Items */}
          <div>
            {cart.map(item => (
              <div key={item.id} className="cart-item">
                <img
                  src={item.product_image}
                  alt={item.product_name}
                  onError={e => { e.target.src = 'https://via.placeholder.com/80?text=?'; }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>
                    {item.brand_name}
                  </div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{item.product_name}</div>
                  {item.size && <div style={{ fontSize: 13, color: '#888' }}>Size: {item.size}</div>}
                  <div style={{ fontWeight: 700, color: 'var(--accent)', marginTop: 4 }}>{formatPrice(item.product_price)}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
                  <div className="qty-control">
                    <button onClick={() => handleQty(item, -1)}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => handleQty(item, 1)}>+</button>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{formatPrice(item.product_price * item.quantity)}</div>
                  <button
                    onClick={() => handleRemove(item.id)}
                    style={{ background: 'none', border: 'none', color: '#888', fontSize: 13, cursor: 'pointer' }}>
                    🗑 Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div style={{ background: 'white', borderRadius: 16, padding: 28, boxShadow: 'var(--shadow)', position: 'sticky', top: 80 }}>
            <h2 style={{ fontSize: 24, marginBottom: 20 }}>TỔNG ĐƠN HÀNG</h2>
            {cart.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#555', marginBottom: 8 }}>
                <span>{item.product_name} x{item.quantity}</span>
                <span>{formatPrice(item.product_price * item.quantity)}</span>
              </div>
            ))}
            <div style={{ borderTop: '2px solid var(--border)', margin: '16px 0', paddingTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 700 }}>
                <span>Tổng cộng</span>
                <span style={{ color: 'var(--accent)' }}>{formatPrice(total)}</span>
              </div>
            </div>
            <button
              className="btn btn-accent"
              style={{ width: '100%', padding: '16px', fontSize: 16, marginBottom: 12 }}
              onClick={() => navigate('/checkout')}>
              Đặt hàng ngay →
            </button>
            <button
              className="btn btn-outline"
              style={{ width: '100%' }}
              onClick={() => navigate('/products')}>
              Tiếp tục mua sắm
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
