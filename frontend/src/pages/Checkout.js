import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCart, createOrder, validateVoucher, useVoucher } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

const Checkout = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [form, setForm] = useState({ shipping_address: '', phone: '', note: '' });
  const [error, setError] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  const [voucher, setVoucher] = useState(null);
  const [voucherError, setVoucherError] = useState('');
  const [voucherLoading, setVoucherLoading] = useState(false);
  const { refreshCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  const [provinceCode, setProvinceCode] = useState('');
  const [wardCode, setWardCode] = useState('');
  const [addressDetail, setAddressDetail] = useState('');

  useEffect(() => {
    getCart()
      .then(r => {
        if (r.data.cart.length === 0) navigate('/cart');
        setCart(r.data.cart);
      })
      .catch(() => navigate('/cart'))
      .finally(() => setLoading(false));

    if (user) {
      setForm(f => ({ ...f, phone: user.phone || '' }));
    }

    fetch('https://provinces.open-api.vn/api/v2/p/')
      .then(r => r.json())
      .then(setProvinces)
      .catch(() => {});
  }, []);

  const normalize = (str) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  const [provinceQuery, setProvinceQuery] = useState('');
  const [wardQuery, setWardQuery] = useState('');
  const [showProvinceList, setShowProvinceList] = useState(false);
  const [showWardList, setShowWardList] = useState(false);

  const selectProvince = (p) => {
    setProvinceCode(p.code);
    setProvinceQuery(p.name);
    setShowProvinceList(false);
    setWardCode('');
    setWardQuery('');
    setWards([]);
    fetch(`https://provinces.open-api.vn/api/v2/p/${p.code}?depth=2`)
      .then(r => r.json())
      .then(data => setWards(data.wards || []))
      .catch(() => {});
  };

  const selectWard = (w) => {
    setWardCode(w.code);
    setWardQuery(w.name);
    setShowWardList(false);
  };

  const filteredProvinces = provinces.filter(p => normalize(p.name).includes(normalize(provinceQuery)));
  const filteredWards = wards.filter(w => normalize(w.name).includes(normalize(wardQuery)));

  useEffect(() => {
    const provinceName = provinces.find(p => p.code === Number(provinceCode))?.name || '';
    const wardName = wards.find(w => w.code === Number(wardCode))?.name || '';
    const full = [addressDetail, wardName, provinceName].filter(Boolean).join(', ');
    setForm(f => ({ ...f, shipping_address: full }));
  }, [addressDetail, wardCode, provinceCode, provinces, wards]);

  const SHIPPING_FEE = 35000;
  const total = cart.reduce((sum, i) => sum + i.product_price * i.quantity, 0);
  const shippingFee = voucher && voucher.type === 'freeship' ? 0 : SHIPPING_FEE;
  const percentDiscount = voucher && voucher.type === 'percent' ? Math.round(total * voucher.value / 100) : 0;
  const grandTotal = total + shippingFee - percentDiscount;

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return;
    setVoucherLoading(true);
    setVoucherError('');
    setVoucher(null);
    try {
      const res = await validateVoucher({ code: voucherCode, order_amount: total });
      setVoucher(res.data.voucher);
    } catch (err) {
      setVoucherError(err.response?.data?.message || 'Mã voucher không hợp lệ');
    } finally { setVoucherLoading(false); }
  };

  const handleOrder = async (e) => {
    e.preventDefault();
       if (!provinceCode || !wardCode || !addressDetail.trim()) { setError('Vui lòng chọn đầy đủ tỉnh/thành, phường/xã và nhập địa chỉ chi tiết'); return; }
    if (!form.phone) { setError('Vui lòng nhập số điện thoại'); return; }
    setPlacing(true);
    setError('');
    try {
      const res = await createOrder({ ...form, voucher_code: voucher?.code });
      await refreshCart();
            navigate('/order-success', { state: { orderId: res.data.orderId } });
    } catch (err) {
      setError(err.response?.data?.message || 'Đặt hàng thất bại');
    } finally { setPlacing(false); }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div className="container page">
      <h1 className="page-title" style={{ marginBottom: 32 }}>THANH TOÁN</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 40, alignItems: 'start' }}>
        {/* Form */}
        <div style={{ background: 'white', borderRadius: 16, padding: 32, boxShadow: 'var(--shadow)' }}>
          <h2 style={{ fontSize: 24, marginBottom: 24 }}>THÔNG TIN GIAO HÀNG</h2>

          {error && (
            <div style={{ background: '#FFEBEE', color: '#c62828', padding: '12px 16px', borderRadius: 10, marginBottom: 20, fontSize: 14 }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleOrder}>
            <div className="form-group">
              <label>Họ tên người nhận</label>
              <input value={user?.name || ''} disabled style={{ background: '#f5f5f5' }} />
            </div>
            <div className="form-group">
              <label>Số điện thoại *</label>
              <input placeholder="" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
            </div>
                        <div className="form-group" style={{ position: 'relative' }}>
              <label>Tỉnh / Thành phố *</label>
              <input
                placeholder="Gõ để tìm tỉnh/thành phố..."
                value={provinceQuery}
                onChange={e => { setProvinceQuery(e.target.value); setShowProvinceList(true); setProvinceCode(''); }}
                onFocus={() => setShowProvinceList(true)}
                onBlur={() => setTimeout(() => setShowProvinceList(false), 150)}
                required
              />
              {showProvinceList && provinceQuery && filteredProvinces.length > 0 && (
                <div style={{ position: 'absolute', zIndex: 10, background: 'white', border: '1px solid #ddd', borderRadius: 8, width: '100%', maxHeight: 220, overflowY: 'auto', marginTop: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  {filteredProvinces.map(p => (
                    <div key={p.code}
                      onMouseDown={() => selectProvince(p)}
                      style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 14 }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
                      onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                      {p.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="form-group" style={{ position: 'relative' }}>
              <label>Phường / Xã *</label>
              <input
                placeholder={provinceCode ? "Gõ để tìm phường/xã..." : "Chọn tỉnh/thành phố trước"}
                value={wardQuery}
                onChange={e => { setWardQuery(e.target.value); setShowWardList(true); setWardCode(''); }}
                onFocus={() => setShowWardList(true)}
                onBlur={() => setTimeout(() => setShowWardList(false), 150)}
                disabled={!provinceCode}
                required
              />
              {showWardList && wardQuery && filteredWards.length > 0 && (
                <div style={{ position: 'absolute', zIndex: 10, background: 'white', border: '1px solid #ddd', borderRadius: 8, width: '100%', maxHeight: 220, overflowY: 'auto', marginTop: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  {filteredWards.map(w => (
                    <div key={w.code}
                      onMouseDown={() => selectWard(w)}
                      style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 14 }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
                      onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                      {w.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="form-group">
              <label>Địa chỉ chi tiết *</label>
              <textarea
                placeholder="Số nhà, tên đường..."
                value={addressDetail}
                onChange={e => setAddressDetail(e.target.value)}
                rows={2} required />
            </div>
            <div className="form-group">
              <label>Ghi chú</label>
              <textarea
                placeholder="Ghi chú cho đơn hàng (tùy chọn)"
                value={form.note}
                onChange={e => setForm({ ...form, note: e.target.value })}
                rows={2} />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontWeight: 500, fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 8 }}>Mã giảm giá</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  placeholder="Nhập mã voucher..."
                  value={voucherCode}
                  onChange={e => { setVoucherCode(e.target.value.toUpperCase()); setVoucher(null); setVoucherError(''); }}
                  style={{ flex: 1 }}
                />
                <button type="button" className="btn btn-outline" onClick={handleApplyVoucher} disabled={voucherLoading}>
                  {voucherLoading ? '...' : 'Áp dụng'}
                </button>
              </div>
              {voucherError && <div style={{ color: '#c62828', fontSize: 13, marginTop: 6 }}>⚠️ {voucherError}</div>}
              {voucher && (
                <div style={{ background: '#E8F5E9', color: '#2E7D32', padding: '10px 14px', borderRadius: 8, marginTop: 8, fontSize: 14 }}>
                  ✅ {voucher.description || `Áp dụng thành công: ${voucher.code}`}
                </div>
              )}
            </div>

            <div style={{ padding: 16, background: '#f9f9f9', borderRadius: 12, marginBottom: 24, fontSize: 14 }}>
              <div style={{ fontWeight: 500, marginBottom: 8 }}>💳 Phương thức thanh toán</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#555' }}>
                <input type="radio" checked readOnly /> Thanh toán khi nhận hàng (COD)
              </div>
            </div>

            <button type="submit" className="btn btn-accent" style={{ width: '100%', padding: '16px', fontSize: 16 }} disabled={placing}>
              {placing ? 'Đang đặt hàng...' : `Đặt hàng - ${formatPrice(grandTotal)}`}            </button>
          </form>
        </div>

        {/* Order summary */}
        <div style={{ background: 'white', borderRadius: 16, padding: 28, boxShadow: 'var(--shadow)', position: 'sticky', top: 80 }}>
          <h2 style={{ fontSize: 24, marginBottom: 20 }}>ĐƠN HÀNG ({cart.length})</h2>
          {cart.map(item => (
            <div key={item.id} style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
              <img src={item.product_image} alt={item.product_name}
                style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, background: '#f0f0f0' }}
                onError={e => { e.target.src = 'https://via.placeholder.com/56?text=?'; }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{item.name}</div>
{item.size && <div style={{ fontSize: 12, color: '#888' }}>Size: {item.size}</div>}              </div>
              <div style={{ fontWeight: 500, fontSize: 14, whiteSpace: 'nowrap' }}>{formatPrice(item.product_price * item.quantity)}</div>
            </div>
          ))}
          <div style={{ borderTop: '2px solid var(--border)', paddingTop: 16, marginTop: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
              <span>Tạm tính</span><span>{formatPrice(total)}</span>
            </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
              <span>Vận chuyển</span>
              {shippingFee === 0 ? (
                <span>
                  <span style={{ textDecoration: 'line-through', color: '#aaa', marginRight: 6 }}>{formatPrice(SHIPPING_FEE)}</span>
                  <span style={{ color: 'green', fontWeight: 500 }}>Miễn phí</span>
                </span>
              ) : (
                <span>{formatPrice(SHIPPING_FEE)}</span>
              )}
            </div>
            {voucher && voucher.type === 'percent' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, color: '#2E7D32' }}>
                <span>Giảm {voucher.value}%</span>
                <span>-{formatPrice(percentDiscount)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 500 }}>
              <span>Tổng cộng</span>
              <span style={{ color: 'var(--accent)' }}>{formatPrice(grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
