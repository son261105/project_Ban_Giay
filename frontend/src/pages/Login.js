import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import { useAuth } from '../context/AuthContext';

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [pwActive, setPwActive] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

    const handleSubmit = async (e) => {
    e.preventDefault();

    const email = form.email.trim().toLowerCase();
    if (!email) { setError('Vui lòng nhập email'); return; }
    if (/\s/.test(email)) { setError('Email không được chứa khoảng trắng'); return; }
    if (!/^[^\s@]+@gmail\.com$/.test(email)) { setError('Email phải đúng định dạng Gmail (vd: ten@gmail.com)'); return; }
    if (!form.password) { setError('Vui lòng nhập mật khẩu'); return; }

    setLoading(true);
    try {
      const res = await login({ email, password: form.password });
      loginUser(res.data.user, res.data.token);
      if (res.data.user.role === 'admin') navigate('/admin');
      else navigate('/');
    } catch (err) {
      setLoading(false);
      if (!err.response) { setError('Không thể kết nối tới máy chủ. Vui lòng thử lại.'); return; }
      setError(err.response.data?.message || 'Đăng nhập thất bại');
    }
  };

  const eyeButtonStyle = (visible) => ({
    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#555', display: 'flex',
    opacity: visible ? 1 : 0, pointerEvents: visible ? 'auto' : 'none', transition: 'opacity 0.15s'
  });

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">ĐĂNG NHẬP</h1>
        <p className="auth-subtitle">Chào mừng trở lại! Hãy đăng nhập để tiếp tục.</p>

        {error && (
          <div style={{ background: '#FFEBEE', color: '#c62828', padding: '12px 16px', borderRadius: 10, marginBottom: 20, fontSize: 15 }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>Email</label>
            <input type="text" autoComplete="username" placeholder="email@gmail.com" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Mật khẩu</label>
            <div style={{ position: 'relative' }}
              onMouseEnter={() => setPwActive(true)} onMouseLeave={() => setPwActive(false)}
              onFocus={() => setPwActive(true)} onBlur={() => setPwActive(false)}>
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                style={eyeButtonStyle(pwActive)}>
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
              <input type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Nhập mật khẩu" value={form.password}
                style={{ paddingRight: 44 }}
                onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
          </div>
                    <div style={{ textAlign: 'right', marginBottom: 12 }}>
            <Link to="/forgot-password" style={{ color: 'var(--accent)', fontWeight: 600, fontSize: 14 }}>Quên mật khẩu?</Link>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: 16, marginTop: 8 }} disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 15, color: '#888' }}>
          Chưa có tài khoản? <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;