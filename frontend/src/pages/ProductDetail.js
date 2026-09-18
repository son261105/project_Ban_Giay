import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProduct, addToCart } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState('');
    const [adding, setAdding] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const { user } = useAuth();
  const { refreshCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    getProduct(id)
      .then(r => setProduct(r.data.product))
      .catch(() => navigate('/products'))
      .finally(() => setLoading(false));
  }, [id]);

  const stockOfSelected = product?.stock_by_size?.find(s => s.size === selectedSize)?.quantity || 0;

  const handleAddToCart = async () => {
    if (!user) { navigate('/login'); return; }
    if (!selectedSize) { setMsg('⚠️ Vui lòng chọn size'); return; }
    setAdding(true);
    try {
      await addToCart({ product_id: product.id, quantity: qty, size: selectedSize });
      await refreshCart();
      setMsg('✅ Đã thêm vào giỏ hàng!');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.message || 'Lỗi'));
    } finally { setAdding(false); }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;
  if (!product) return null;

  const stockBySize = product.stock_by_size || [];
  const totalStock = product.stock || 0;

  return (
    <div className="container page">
      <button onClick={() => navigate(-1)}
        style={{ background: 'none', border: 'none', fontSize: 14, color: '#888', marginBottom: 24, cursor: 'pointer' }}>
        ← Quay lại
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'start' }}>
                {/* Gallery ảnh */}
        <div>
          <div style={{ borderRadius: 20, overflow: 'hidden', background: '#f5f5f5', boxShadow: '0 8px 40px rgba(0,0,0,0.12)' }}>
            <img src={(product.images && product.images[activeImg]) || product.image_url} alt={product.name}
              style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }}
              onError={e => { e.target.src = 'https://via.placeholder.com/600x600?text=No+Image'; }} />
          </div>
                    {product.images && product.images.length > 1 && (
            <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
              {product.images.map((url, idx) => (
                <img key={url + idx} src={url} alt={`${product.name} ${idx + 1}`}
                  onClick={() => setActiveImg(idx)}
                  style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 10, cursor: 'pointer',
                    border: idx === activeImg ? '2px solid var(--accent)' : '2px solid transparent',
                    opacity: idx === activeImg ? 1 : 0.7 }} />
              ))}
            </div>
          )}

                    {/* Mô tả chi tiết - nằm ngay dưới ảnh, cột trái */}
          {product.description_detail && (
            <div style={{ marginTop: 32 }}>
              <h2 style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 500, fontSize: 22, letterSpacing: 1, marginBottom: 12, textTransform: 'uppercase' }}>Mô tả chi tiết</h2>
              <div
                className="product-rich-text"
                dangerouslySetInnerHTML={{ __html: product.description_detail }}
              />
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>
            {product.brand_name}
          </div>
          <h1 style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontSize: 48, lineHeight: 1.1, marginBottom: 16 }}>
            {product.name}
          </h1>
          <div style={{ fontSize: 36, fontWeight: 500, color: 'var(--accent)', marginBottom: 20 }}>
            {formatPrice(product.price)}
          </div>

          {product.description && (
            <p style={{ color: '#555', lineHeight: 1.7, marginBottom: 28, fontSize: 15 }}>{product.description}</p>
          )}

          {/* Overall stock badge */}
          <div style={{ marginBottom: 24 }}>
            <span style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500,
              background: totalStock > 0 ? '#E8F5E9' : '#FFEBEE',
              color: totalStock > 0 ? '#2E7D32' : '#c62828'
            }}>
              {totalStock > 0 ? `✓ Còn hàng (${totalStock} đôi)` : '✕ Hết hàng'}
            </span>
          </div>

          {/* Size picker with stock per size */}
          {stockBySize.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontWeight: 500, marginBottom: 12 }}>Chọn size:</div>
              <div className="size-grid">
                {stockBySize.map(({ size, quantity }) => (
                  <button
                    key={size}
                    className={`size-btn ${selectedSize === size ? 'selected' : ''} ${quantity === 0 ? 'disabled' : ''}`}
                    onClick={() => { if (quantity > 0) { setSelectedSize(size); setQty(1); } }}
                    disabled={quantity === 0}
                    title={quantity === 0 ? 'Hết hàng' : `Còn ${quantity} đôi`}
                    style={{ position: 'relative', opacity: quantity === 0 ? 0.4 : 1 }}
                  >
                    {size}
                    {quantity > 0 && quantity <= 3 && (
                      <span style={{
                        position: 'absolute', top: -6, right: -6,
                        background: '#FF5722', color: '#fff',
                        borderRadius: '50%', width: 16, height: 16,
                        fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 500
                      }}>{quantity}</span>
                    )}
                  </button>
                ))}
              </div>
              {selectedSize && (
                <div style={{ marginTop: 8, fontSize: 13, color: stockOfSelected <= 3 ? '#FF5722' : '#2E7D32' }}>
                  {stockOfSelected > 0 ? `Còn ${stockOfSelected} đôi size ${selectedSize}` : `Hết hàng size ${selectedSize}`}
                </div>
              )}
            </div>
          )}

          {/* Quantity */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontWeight: 500, marginBottom: 12 }}>Số lượng:</div>
            <div className="qty-control">
              <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
              <span>{qty}</span>
              <button onClick={() => setQty(q => Math.min(stockOfSelected || 1, q + 1))}>+</button>
            </div>
          </div>

          {msg && (
            <div style={{
              padding: '12px 16px', borderRadius: 10, marginBottom: 16, fontSize: 14,
              background: msg.startsWith('✅') ? '#E8F5E9' : '#FFEBEE',
              color: msg.startsWith('✅') ? '#2E7D32' : '#c62828'
            }}>{msg}</div>
          )}

          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-accent" style={{ flex: 1, fontSize: 16, padding: '16px' }}
              onClick={handleAddToCart} disabled={adding || totalStock === 0}>
              {adding ? 'Đang thêm...' : '🛒 Thêm vào giỏ hàng'}
            </button>
            <button className="btn btn-outline" style={{ padding: '16px 20px' }} onClick={() => navigate('/cart')}>
              Xem giỏ
            </button>
          </div>

                                        <div style={{ marginTop: 24, padding: 20, background: '#f9f9f9', borderRadius: 12, fontSize: 13, color: '#666' }}>
            <div style={{ marginBottom: 8 }}>🚚 Giao hàng miễn phí từ 2.000.000đ</div>
            <div style={{ marginBottom: 8 }}>🔄 Đổi trả trong 30 ngày</div>
            <div>✅ Hàng chính hãng 100%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
