import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProducts, getBrands, getPublicVouchers } from '../services/api';

const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [brands, setBrands] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getProducts({ limit: 8 }).then(r => setFeatured(r.data.products)).catch(() => {});
    getBrands().then(r => setBrands(r.data.brands)).catch(() => {});
    getPublicVouchers().then(r => setVouchers(r.data.vouchers)).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero Slider */}
      <div style={{ position: 'relative', overflow: 'hidden', height: 600, maxWidth: 1320, margin: '24px auto', borderRadius: 16 }}>
        {[
          {
            img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1400&q=80',
            brand: 'NIKE',
            title: 'AIR MAX COLLECTION',
            sub: 'Khám phá bộ sưu tập Nike mới nhất',
          },
          {
            img: '/images/adidas-banner.jpg',
            brand: 'ADIDAS',
            title: 'ULTRABOOST SERIES',
            sub: 'Hiệu suất vượt trội, phong cách đỉnh cao',
          },
        ].map((slide, i) => (
          <div key={i} id={`slide-${i}`} style={{
            position: 'absolute', top: 0, left: `${i * 100}%`, width: '100%', height: '100%',
            transition: 'left 0.5s ease',
          }}>
            <img src={slide.img} alt={slide.brand} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{
              position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
            }}>
              <div style={{ color: 'var(--accent)', fontSize: 14, fontWeight: 500, letterSpacing: 4, marginBottom: 8 }}>{slide.brand}</div>
              <h1 style={{ color: 'white', fontSize: 52, fontWeight: 500, marginBottom: 12 }}>{slide.title}</h1>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, marginBottom: 24 }}>{slide.sub}</p>
              <Link to="/products" className="btn btn-accent" style={{ fontSize: 16, padding: '14px 40px' }}>Xem ngay</Link>
            </div>
          </div>
        ))}

        {/* Nút prev/next */}
        {[
          { dir: -1, label: '‹', side: { left: 20 } },
          { dir: 1, label: '›', side: { right: 20 } },
        ].map(({ dir, label, side }) => (
          <button key={dir} onClick={() => {
            const cur = parseInt(document.getElementById('slider-state')?.dataset.cur || 0);
            const next = (cur + dir + 2) % 2;
            document.querySelectorAll('[id^="slide-"]').forEach((el, i) => {
              el.style.left = `${(i - next) * 100}%`;
            });
            document.getElementById('slider-state').dataset.cur = next;
            document.querySelectorAll('.slider-dot').forEach((d, i) => {
              d.style.background = i === next ? 'white' : 'rgba(255,255,255,0.4)';
            });
          }} style={{
            position: 'absolute', top: '50%', transform: 'translateY(-50%)', ...side,
            background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white',
            fontSize: 32, width: 48, height: 48, borderRadius: '50%', cursor: 'pointer', zIndex: 10,
            opacity: 0, transition: 'opacity 0.3s',
          }}>{label}</button>
        ))}

        {/* Dots */}
        <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8, zIndex: 10 }}>
          {[0, 1].map(i => (
            <div key={i} className="slider-dot" style={{
              width: 10, height: 10, borderRadius: '50%',
              background: i === 0 ? 'white' : 'rgba(255,255,255,0.4)', cursor: 'pointer',
            }} />
          ))}
        </div>

        <span id="slider-state" data-cur="0" style={{ display: 'none' }} />
      </div>

      {/* Voucher Section */}
<div style={{ background: '#f5f6f8', padding: '48px 0 24px', margin: '8px 0' }}>
  <div className="container">
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--accent)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>Ưu đãi hôm nay</div>
        <h2 style={{ fontSize: 28, fontWeight: 500, margin: 0 }}>MÃ GIẢM GIÁ</h2>
      </div>
    </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      {vouchers.map(raw => {
        const v = {
          code: raw.code,
          type: raw.type,
          color: raw.type === 'freeship' ? '#1F2937' : 'var(--accent)',
          title: raw.type === 'freeship' ? 'Miễn phí vận chuyển' : `Giảm ${raw.value}%`,
          desc: `Cho đơn hàng từ ${new Intl.NumberFormat('vi-VN').format(raw.min_order_amount)}đ`,
          end: new Date(raw.end_date).toLocaleDateString('vi-VN'),
        };
        return v;
      }).map(v => (
        <div key={v.code} style={{
          display: 'flex', borderRadius: 16, overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)', flex: '1', minWidth: 280, maxWidth: 400,
          border: '1px solid #f0f0f0'
        }}>
                    <div style={{
            minWidth: 90, background: v.color, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', padding: '20px 10px', gap: 6
          }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 500, letterSpacing: 1, textTransform: 'uppercase', textAlign: 'center' }}>
              {v.type === 'freeship' ? 'FREESHIP' : 'DISCOUNT'}
            </div>
          </div>
          <div style={{ width: 1, background: 'repeating-linear-gradient(to bottom, #e0e0e0 0px, #e0e0e0 6px, transparent 6px, transparent 12px)' }} />
          <div style={{ flex: 1, padding: '20px 20px' }}>
            <div style={{ fontWeight: 500, fontSize: 18, marginBottom: 4, color: '#1F2937' }}>{v.title}</div>
            <div style={{ fontSize: 13, color: '#888', marginBottom: 12 }}>{v.desc}</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 12, color: '#aaa', marginBottom: 2 }}>HSD: {v.end}</div>
                <div style={{
                  display: 'inline-block', background: '#f5f5f5', borderRadius: 6,
                  padding: '4px 10px', fontSize: 13, fontWeight: 500, letterSpacing: 1, color: '#333'
                }}>{v.code}</div>
              </div>
              <button
                onClick={() => { navigator.clipboard.writeText(v.code); alert(`Đã sao chép: ${v.code}`); }}
                style={{
                  background: v.color, color: 'white', border: 'none', borderRadius: 8,
                  padding: '8px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap'
                }}>
                Sao chép
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</div>

{/* Brands */}
      <div style={{ background: 'white', padding: '40px 0', borderBottom: '1px solid #eee' }}>
        <div className="container">
          <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
            {brands.map(b => (
              <div key={b.id} style={{ opacity: 0.5, filter: 'grayscale(1)', transition: 'all 0.2s', cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.filter = 'grayscale(0)'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = 0.5; e.currentTarget.style.filter = 'grayscale(1)'; }}
                onClick={() => navigate(`/products?brand=${b.id}`)}>
                <img src={b.logo_url} alt={b.name} style={{ height: '36px', objectFit: 'contain' }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured */}
      <div className="container page">
        <div className="page-header">
          <h2 className="page-title">SẢN PHẨM NỔI BẬT</h2>
          <Link to="/products" className="btn btn-outline">Xem tất cả →</Link>
        </div>
        <div className="product-grid">
          {featured.map(product => (
            <div key={product.id} className="product-card" onClick={() => navigate(`/products/${product.id}`)}>
              <img
                src={product.image_url}
                alt={product.name}
                onError={e => { e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'; }}
              />
              <div className="product-card-body">
                <div className="product-card-brand">{product.brand_name}</div>
                <div className="product-card-name">{product.name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                  <div className="product-card-price">{formatPrice(product.price)}</div>
                  <span style={{ fontSize: 12, color: '#888' }}>Còn: {product.stock}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Banner */}
      <div style={{ background: 'var(--primary)', color: 'white', padding: '60px 0', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontSize: 48, fontWeight: 500, marginBottom: 16 }}>MIỄN PHÍ VẬN CHUYỂN</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16, marginBottom: 24 }}>Cho đơn hàng từ 2.000.000đ trở lên</p>
          <Link to="/products" className="btn btn-accent">Mua ngay</Link>
        </div>
      </div>
      {/* Footer */}
      <footer style={{ background: '#111', color: 'white', padding: '60px 0 24px' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 40 }}>

            {/* Logo & Mô tả */}
            <div>
              <div style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontSize: 32, letterSpacing: 2, marginBottom: 8 }}>
                DS_<span style={{ color: 'var(--accent)' }}>Sport</span>              </div>
              <p style={{ color: '#888', fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
                DS_Sport là nền tảng mua sắm giày chính hãng hàng đầu với hàng nghìn sản phẩm từ các thương hiệu nổi tiếng thế giới.              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                {['Facebook', 'Instagram', 'Zalo'].map(s => (
                  <div key={s} style={{ background: 'rgba(255,255,255,0.1)', padding: '6px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer', color: '#ccc' }}>{s}</div>
                ))}
              </div>
            </div>

            {/* Chính sách */}
            <div>
              <div style={{ fontWeight: 500, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16, color: 'var(--accent)' }}>Chính sách</div>
              {['Thanh toán & giao hàng', 'Chính sách bảo mật', 'Điều khoản sử dụng', 'Chính sách đổi trả'].map(item => (
                <div key={item} style={{ color: '#888', fontSize: 14, marginBottom: 10, cursor: 'pointer' }}
                  onMouseEnter={e => e.target.style.color = 'white'}
                  onMouseLeave={e => e.target.style.color = '#888'}>{item}</div>
              ))}
            </div>

            {/* Về DS_Sport */}            <div>
              <div style={{ fontWeight: 500, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16, color: 'var(--accent)' }}>Về DS_Sport</div>              {['Giới thiệu', 'Tuyển dụng', 'Tin tức', 'Liên hệ'].map(item => (
                <div key={item} style={{ color: '#888', fontSize: 14, marginBottom: 10, cursor: 'pointer' }}
                  onMouseEnter={e => e.target.style.color = 'white'}
                  onMouseLeave={e => e.target.style.color = '#888'}>{item}</div>
              ))}
            </div>

            {/* Hotline */}
            <div>
              <div style={{ fontWeight: 500, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16, color: 'var(--accent)' }}>Người hỗ trợ</div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Mua hàng (9:00 - 21:00)</div>
                <div style={{ fontSize: 20, fontWeight: 500, color: 'var(--accent)' }}>📞 0353950356</div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>CSKH (9:00 - 21:00)</div>
                <div style={{ fontSize: 20, fontWeight: 500, color: 'var(--accent)' }}>📞 0353950356</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '12px 16px' }}>
                <div style={{ fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, color: '#ccc' }}>Thanh toán an toàn</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                 
                </div>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ color: '#555', fontSize: 13 }}>©DS_Sport. All rights reserved.</div>         
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
