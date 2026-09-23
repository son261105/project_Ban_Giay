import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCart, createOrder, validateVoucher, getPublicVouchers } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

const Checkout = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [form, setForm] = useState({ shipping_address: '', phone: '', note: '' });
  const [error, setError] = useState('');
  const [availableVouchers, setAvailableVouchers] = useState([]);
  const [selectedCodes, setSelectedCodes] = useState([]);
  const [appliedVouchers, setAppliedVouchers] = useState([]);
  const [voucherError, setVoucherError] = useState('');
  const [voucherLoading, setVoucherLoading] = useState(false);
    const [showVoucherDropdown, setShowVoucherDropdown] = useState(false);
  const voucherHoverTimeout = useRef(null);

  const openVoucherDropdown = () => {
    clearTimeout(voucherHoverTimeout.current);
    setShowVoucherDropdown(true);
  };
  const closeVoucherDropdownDelayed = () => {
    voucherHoverTimeout.current = setTimeout(() => setShowVoucherDropdown(false), 350);
  };
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

    getPublicVouchers().then(r => setAvailableVouchers(r.data.vouchers || [])).catch(() => {});
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
  const hasFreeship = appliedVouchers.some(v => v.type === 'freeship' && v.discount > 0);
  const shippingFee = hasFreeship ? 0 : SHIPPING_FEE;
  const percentDiscount = Math.min(
    appliedVouchers.filter(v => v.type === 'percent').reduce((sum, v) => sum + v.discount, 0),
    total
  );
  const grandTotal = total + shippingFee - percentDiscount;

  const toggleVoucher = (code) => {
    setSelectedCodes(prev => prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]);
  };

  useEffect(() => {
    if (selectedCodes.length === 0) {
      setAppliedVouchers([]);
      setVoucherError('');
      return;
    }
    if (total <= 0) return;
    let cancelled = false;
    setVoucherLoading(true);
    validateVoucher({ codes: selectedCodes, order_amount: total })
      .then(res => {
        if (cancelled) return;
        const { vouchers = [], invalid = [] } = res.data;
        setAppliedVouchers(vouchers);
        if (invalid.length > 0) {
          setVoucherError(invalid.map(i => i.message).join(' • '));
          setSelectedCodes(prev => prev.filter(c => !invalid.some(i => i.code === c)));
        } else {
          setVoucherError('');
        }
      })
      .catch(() => { if (!cancelled) setVoucherError('Không thể kiểm tra mã voucher'); })
      .finally(() => { if (!cancelled) setVoucherLoading(false); });
    return () => { cancelled = true; };
  }, [selectedCodes, total]);

  const handleOrder = async (e) => {
    e.preventDefault();
       if (!provinceCode || !wardCode || !addressDetail.trim()) { setError('Vui lòng chọn đầy đủ tỉnh/thành, phường/xã và nhập địa chỉ chi tiết'); return; }
    if (!form.phone) { setError('Vui lòng nhập số điện thoại'); return; }
    setPlacing(true);
    setError('');
    try {
            const res = await createOrder({ ...form, voucher_codes: appliedVouchers.map(v => v.code) });
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
          <h2 style={{ fontSize: 25, marginBottom: 24 }}>THÔNG TIN GIAO HÀNG</h2>

          {error && (
            <div style={{ background: '#FFEBEE', color: '#c62828', padding: '12px 16px', borderRadius: 10, marginBottom: 20, fontSize: 15 }}>
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
                      style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 15 }}
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
                      style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 15 }}
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

           

            <div style={{ padding: 16, background: '#f9f9f9', borderRadius: 12, marginBottom: 24, fontSize: 15 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}> Phương thức thanh toán</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#555' }}>
                <input type="radio" checked readOnly /> Thanh toán khi nhận hàng (COD)
              </div>
            </div>

            <button type="submit" className="btn btn-accent" style={{ width: '100%', padding: '16px', fontSize: 17 }} disabled={placing}>
              {placing ? 'Đang đặt hàng...' : `Đặt hàng - ${formatPrice(grandTotal)}`}            </button>
          </form>
        </div>

        {/* Order summary */}
        <div style={{ background: 'white', borderRadius: 16, padding: 28, boxShadow: 'var(--shadow)', position: 'sticky', top: 80 }}>
          <h2 style={{ fontSize: 25, marginBottom: 20 }}>ĐƠN HÀNG ({cart.length})</h2>
          {cart.map(item => (
            <div key={item.id} style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
              <img src={item.product_image} alt={item.product_name}
                style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, background: '#f0f0f0' }}
                onError={e => { e.target.src = 'https://via.placeholder.com/56?text=?'; }} />
                            <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{item.product_name}</div>
                <div style={{ fontSize: 13, color: '#888', marginTop: 2 }}>
                  {item.size && <span>Size: {item.size}</span>}
                  {item.size && <span> · </span>}
                  <span>SL: {item.quantity}</span>
                </div>
              </div>
              <div style={{ fontWeight: 600, fontSize: 15, whiteSpace: 'nowrap' }}>{formatPrice(item.product_price * item.quantity)}</div>
            </div>
          ))}
                     <div
            className="voucher-picker"
            onMouseEnter={openVoucherDropdown}
            onMouseLeave={closeVoucherDropdownDelayed}
          >
            <style>{`
              .voucher-picker { position: relative; margin-bottom: 20px; }
              .voucher-picker__label {
                font-weight: 600; font-size: 13px; text-transform: uppercase;
                letter-spacing: 0.6px; display: block; margin-bottom: 8px; color: #111;
              }
              .voucher-box {
                display: flex; flex-wrap: wrap; gap: 6px; align-items: center;
                min-height: 44px; padding: 8px 12px; border: 1px solid #111;
                border-radius: 10px; background: #fff; cursor: pointer;
              }
              .voucher-box__placeholder { font-size: 14px; color: #999; }
              .voucher-chip {
                display: flex; align-items: center; gap: 6px; background: #111; color: #fff;
                font-size: 13px; font-weight: 600; padding: 4px 8px 4px 10px; border-radius: 999px;
              }
              .voucher-chip__remove {
                background: none; border: none; color: #fff; cursor: pointer; font-size: 13px;
                line-height: 1; padding: 0; opacity: 0.8;
              }
              .voucher-chip__remove:hover { opacity: 1; }
              .voucher-dropdown {
                position: absolute; left: 0; right: 0; top: calc(100% + 6px); z-index: 20;
                background: #fff; border: 1px solid #111; border-radius: 10px;
                max-height: 260px; overflow-y: auto; box-shadow: 0 8px 20px rgba(0,0,0,0.12);
              }
              .voucher-option {
                display: flex; align-items: flex-start; gap: 10px; padding: 10px 14px;
                cursor: pointer; border-bottom: 1px solid #eee; transition: background .15s ease, color .15s ease;
              }
              .voucher-option:last-child { border-bottom: none; }
              .voucher-option:hover:not(.voucher-option--disabled):not(.voucher-option--selected) { background: #f2f2f2; }
                            .voucher-option--selected { background: #fff; color: #111; border-color: #111; box-shadow: inset 0 0 0 1px #111; }
              .voucher-option--selected:hover { background: #f2f2f2; }
              .voucher-option--disabled { cursor: not-allowed; color: #999; }
              .voucher-option__code { font-weight: 700; font-size: 14px; letter-spacing: 0.5px; }
              .voucher-option__desc { font-size: 12.5px; margin-top: 2px; opacity: 0.85; }
              .voucher-option__note { font-size: 11.5px; margin-top: 4px; font-style: italic; opacity: 0.75; }
              .voucher-picker__error { font-size: 13px; margin-top: 8px; color: #111; }
                            .voucher-picker__empty { padding: 10px 14px; font-size: 13px; color: #888; }
            `}</style>
            <label className="voucher-picker__label">Mã giảm giá {voucherLoading && '(đang kiểm tra...)'}</label>

            <div className="voucher-box" onClick={() => setShowVoucherDropdown(v => !v)}>
              {selectedCodes.length === 0 ? (
                <span className="voucher-box__placeholder">Di chuột vào để chọn mã giảm giá...</span>
              ) : (
                selectedCodes.map(code => (
                  <span key={code} className="voucher-chip">
                    {code}
                    <button
                      type="button"
                      className="voucher-chip__remove"
                      onClick={(e) => { e.stopPropagation(); toggleVoucher(code); }}
                    >✕</button>
                  </span>
                ))
              )}
            </div>

            {showVoucherDropdown && (
              availableVouchers.length === 0 ? (
                <div className="voucher-dropdown">
                  <div className="voucher-picker__empty">Hiện chưa có mã giảm giá khả dụng</div>
                </div>
              ) : (
                <div className="voucher-dropdown">
                  {availableVouchers.map(v => {
                    const eligible = total > 0 && total >= v.min_order_amount;
                    const selected = selectedCodes.includes(v.code);
                    return (
                      <div
                        key={v.code}
                        className={`voucher-option${selected ? ' voucher-option--selected' : ''}${!eligible ? ' voucher-option--disabled' : ''}`}
                        onClick={() => eligible && toggleVoucher(v.code)}
                      >
                        <div style={{ flex: 1 }}>
                          <div className="voucher-option__code">{v.code}</div>
                          <div className="voucher-option__desc">
                            {v.description || (v.type === 'freeship' ? 'Miễn phí vận chuyển' : `Giảm ${v.value}%`)}
                          </div>
                          {!eligible && (
                            <div className="voucher-option__note">
                              Áp dụng cho đơn từ {formatPrice(v.min_order_amount)}
                            </div>
                          )}
                        </div>
                        {selected && <span>✓</span>}
                      </div>
                    );
                  })}
                </div>
              )
            )}
            {voucherError && <div className="voucher-picker__error">⚠ {voucherError}</div>}
          </div>

          <div style={{ borderTop: '2px solid var(--border)', paddingTop: 16, marginTop: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 15 }}>
              <span>Tạm tính</span><span>{formatPrice(total)}</span>
            </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 15 }}>
              <span>Vận chuyển</span>
              {shippingFee === 0 ? (
                <span>
                  <span style={{ textDecoration: 'line-through', color: '#aaa', marginRight: 6 }}>{formatPrice(SHIPPING_FEE)}</span>
                  <span style={{ color: 'green', fontWeight: 600 }}>Miễn phí</span>
                </span>
              ) : (
                <span>{formatPrice(SHIPPING_FEE)}</span>
              )}
            </div>
                        {appliedVouchers.filter(v => v.type === 'percent').map(v => (
              <div key={v.code} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 15, color: '#111' }}>
                <span>{v.code}</span>
                <span>-{formatPrice(v.discount)}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 19, fontWeight: 600 }}>
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
