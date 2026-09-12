import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, logoutUser, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => { logoutUser(); navigate('/'); };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">KICK<span>ZONE</span></Link>
      <div className="navbar-links" style={{ alignItems: 'center', marginLeft: 'auto' }}>
        {user && <Link to="/orders">Đơn hàng</Link>}
        <Link to="/products" title="Sản phẩm" style={{ display: 'flex', alignItems: 'center' }}>
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
            <span
              style={{ color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              title={user.name}
              onClick={() => navigate('/profile')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </span>
            <button onClick={handleLogout}>Đăng xuất</button>
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