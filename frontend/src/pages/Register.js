import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { setError('Mật khẩu phải ít nhất 6 ký tự'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await register(form);
      loginUser(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">ĐĂNG KÝ</h1>
        <p className="auth-subtitle">Tạo tài khoản để bắt đầu mua sắm!</p>

        {error && (
          <div style={{ background: '#FFEBEE', color: '#c62828', padding: '12px 16px', borderRadius: 10, marginBottom: 20, fontSize: 14 }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Họ tên *</label>
            <input placeholder="Nhập họ tên" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input type="email" placeholder="email@gmail.com" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Mật khẩu *</label>
            <input type="password" placeholder="Tối thiểu 6 ký tự" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Số điện thoại</label>
            <input placeholder="Nhập số điện thoại " value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
          
          <button type="submit" className="btn btn-accent" style={{ width: '100%', padding: '14px', fontSize: 15, marginTop: 8 }} disabled={loading}>
            {loading ? 'Đang đăng ký...' : 'Tạo tài khoản'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#888' }}>
          Đã có tài khoản? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
