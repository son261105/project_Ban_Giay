import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { requestRegisterOtp, verifyRegisterOtp } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (step !== 'otp' || secondsLeft <= 0) return;
    const timer = setInterval(() => setSecondsLeft(s => s - 1), 1000);
    return () => clearInterval(timer);
  }, [step, secondsLeft]);

  const formatTime = (s) => `${Math.floor(s / 60)} phút ${String(s % 60).padStart(2, '0')} giây`;

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (form.name.length > 50) { setError('Họ tên không được vượt quá 50 ký tự'); return; }
    if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(form.email)) { setError('Email phải đúng định dạng Gmail (vd: ten@gmail.com)'); return; }
    if (!/^0(3|5|7|8|9)[0-9]{8}$/.test(form.phone)) { setError('Số điện thoại phải gồm 10 số và đúng định dạng Việt Nam'); return; }
        if (form.password.length < 8 || form.password.length > 64) { setError('Mật khẩu phải từ 8 đến 64 ký tự'); return; }
    if (form.password !== confirmPassword) { setError('Mật khẩu nhập lại không khớp'); return; }
    setLoading(true);
    try {
      const res = await requestRegisterOtp(form);
      setSecondsLeft(res.data.expiresInSeconds || 300);
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.message || 'Gửi mã xác thực thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (otp.length !== 6) { setError('Vui lòng nhập đủ 6 số'); return; }
    setLoading(true);
    try {
      const res = await verifyRegisterOtp({ email: form.email, otp });
      loginUser(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Xác thực thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await requestRegisterOtp(form);
      setSecondsLeft(res.data.expiresInSeconds || 300);
      setOtp('');
    } catch (err) {
      setError(err.response?.data?.message || 'Gửi lại mã thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {step === 'form' ? (
          <>
            <h1 className="auth-title">ĐĂNG KÝ</h1>
            <p className="auth-subtitle">Tạo tài khoản để bắt đầu mua sắm!</p>

            {error && (
              <div style={{ background: '#FFEBEE', color: '#c62828', padding: '12px 16px', borderRadius: 10, marginBottom: 20, fontSize: 14 }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSendOtp}>
              <div className="form-group">
                <label>Họ tên *</label>
                <input placeholder="Nhập họ tên" value={form.name} maxLength={50}
                  onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Số điện thoại *</label>
                <input placeholder="Nhập số điện thoại " value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} required />
              </div>
              <div className="form-group">
                <label>Email (Gmail) *</label>
                <input type="email" placeholder="ten@gmail.com" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
                            <div className="form-group">
                <label>Mật khẩu *</label>
                                <input type="password" placeholder="Từ 8 đến 64 ký tự" value={form.password} maxLength={64}
                  onChange={e => setForm({ ...form, password: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Nhập lại mật khẩu *</label>
                <input type="password" placeholder="Nhập lại mật khẩu" value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)} required />
              </div>

              <button type="submit" className="btn btn-accent" style={{ width: '100%', padding: '14px', fontSize: 15, marginTop: 8 }} disabled={loading}>
                {loading ? 'Đang gửi mã...' : 'Tạo tài khoản'}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="auth-title">NHẬP MÃ XÁC THỰC</h1>
            <p className="auth-subtitle">
              Mã xác thực được gửi đến {form.email}<br />
              {secondsLeft > 0
                ? <>Có hiệu lực trong {formatTime(secondsLeft)}</>
                : <span style={{ color: '#c62828' }}>Mã đã hết hạn</span>}
            </p>

            {error && (
              <div style={{ background: '#FFEBEE', color: '#c62828', padding: '12px 16px', borderRadius: 10, marginBottom: 20, fontSize: 14 }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleVerifyOtp}>
              <div className="form-group">
                <label>Mã OTP (6 số) *</label>
                <input
                  placeholder="------"
                  value={otp}
                  maxLength={6}
                  style={{ textAlign: 'center', fontSize: 24, letterSpacing: 8 }}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                />
              </div>

              <button type="submit" className="btn btn-accent" style={{ width: '100%', padding: '14px', fontSize: 15, marginTop: 8 }} disabled={loading || secondsLeft <= 0}>
                {loading ? 'Đang xác thực...' : 'Xác nhận'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14 }}>
              {secondsLeft <= 0 ? (
                <span onClick={handleResend} style={{ color: 'var(--accent)', fontWeight: 500, cursor: 'pointer' }}>Gửi lại mã</span>
              ) : (
                <span style={{ color: '#aaa' }}>Chưa nhận được mã? Chờ hết thời gian để gửi lại</span>
              )}
            </p>
            <p style={{ textAlign: 'center', marginTop: 8 }}>
              <span onClick={() => setStep('form')} style={{ color: '#888', fontSize: 13, cursor: 'pointer' }}>← Quay lại chỉnh sửa thông tin</span>
            </p>
          </>
        )}

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#888' }}>
          Đã có tài khoản? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 500 }}>Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;