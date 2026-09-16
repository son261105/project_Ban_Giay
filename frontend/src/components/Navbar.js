import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, logoutUser, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logoutUser(); navigate('/'); };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">DS_<span>Sport</span></Link>      <div className="navbar-links" style={{ alignItems: 'center', marginLeft: 'auto' }}>
        {user && (
          <Link to="/orders" title="Đơn hàng" style={{ display: 'flex', alignItems: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m7.5 4.27 9 5.15"></path>
              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
              <path d="m3.3 7 8.7 5 8.7-5"></path>
              <path d="M12 22V12"></path>
            </svg>
          </Link>
        )}        <Link to="/products" title="Sản phẩm" style={{ display: 'flex', alignItems: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </Link>
        {user ? (
          <>
            <Link to="/cart" className="cart-btn" title="Giỏ hàng" style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>

            <span style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.3)', margin: '0 8px' }}></span>

            {isAdmin && <Link to="/admin">⚙️ Admin</Link>}
                        <div
              style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
              onMouseEnter={() => setMenuOpen(true)}
              onMouseLeave={() => setMenuOpen(false)}
            >
              <span
                style={{
                  color: menuOpen ? 'var(--accent)' : 'white',
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                  transition: 'color 0.2s'
                }}
                title={user.name}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </span>

                            {menuOpen && (
                <div style={{
                  position: 'absolute', top: '100%', right: 0, paddingTop: 8,
                  minWidth: 160, zIndex: 100
                }}>
                <div style={{
                  background: 'white', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  overflow: 'hidden'
                }}>
                  <div
                    onClick={() => navigate('/profile')}
                    style={{ padding: '12px 16px', color: '#333', fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
                    onMouseLeave={e => e.currentTarget.style.background = 'white'}
                  >
                    Thông tin cá nhân
                  </div>
                                    <div
                    onClick={handleLogout}
                    style={{ padding: '12px 16px', color: '#c62828', fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap', borderTop: '1px solid #f0f0f0' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
                    onMouseLeave={e => e.currentTarget.style.background = 'white'}
                  >
                    Đăng xuất
                  </div>
                </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/login">Đăng nhập</Link>
            <Link to="/register" style={{ background: 'var(--accent)', color: 'white', borderRadius: '8px', padding: '8px 16px' }}>
              Đăng ký
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;