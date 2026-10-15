import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { requestRegisterOtp, verifyRegisterOtp } from '../services/api';
import { useAuth } from '../context/AuthContext';

const NAME_REGEX = /^\p{L}+(?: \p{L}+)*$/u;
const normalizeName = (s) => s.trim().replace(/\s+/g, ' ');
const PHONE_REGEX = /^0(3|5|7|8|9)[0-9]{8}$/;

const SPECIAL_REGEX = /[!-/:-@[-`{-~]/;
const PASSWORD_RULES = [
  { label: 'Từ 8 đến 64 ký tự', test: (p) => p.length >= 8 && p.length <= 64 },
  { label: 'Có ít nhất 1 chữ hoa ', test: (p) => /[A-Z]/.test(p) },
  { label: 'Có ít nhất 1 chữ thường ', test: (p) => /[a-z]/.test(p) },
  { label: 'Có ít nhất 1 chữ số ', test: (p) => /[0-9]/.test(p) },
  { label: 'Có ít nhất 1 ký tự đặc biệt', test: (p) => SPECIAL_REGEX.test(p) },
  { label: 'Không chứa dấu tiếng Việt', test: (p) => p.length > 0 && !/[^\x00-\x7F]/.test(p) },
];

const getPhoneError = (p) => {
  if (!p) return '';
  if (p.startsWith('+')) return 'Số điện thoại phải bắt đầu bằng số 0';
  if (!/^[0-9]+$/.test(p)) return 'Số điện thoại chỉ được chứa chữ số (không có khoảng trắng, chữ hay ký tự đặc biệt)';
  if (p[0] !== '0') return 'Số điện thoại phải bắt đầu bằng số 0';
  if (p.length < 10) return `Số điện thoại phải gồm đúng 10 số (đang thiếu ${10 - p.length} số)`;
  if (p.length > 10) return `Số điện thoại phải gồm đúng 10 số (đang thừa ${p.length - 10} số)`;
  if (!PHONE_REGEX.test(p)) return 'Đầu số không hợp lệ (phải bắt đầu bằng 03, 05, 07, 08 hoặc 09)';
  return '';
};

const getEmailError = (email) => {
  if (!email) return 'Vui lòng nhập email';
  if (/\s/.test(email)) return 'Email không được chứa khoảng trắng';
  const parts = email.split('@');
  if (parts.length !== 2) return 'Email phải chứa đúng một ký tự @ (vd: ten@gmail.com)';
  const [local, domain] = parts;
  if (domain !== 'gmail.com') return 'Email phải có đuôi @gmail.com';
  if (!local) return 'Vui lòng nhập tên email trước @gmail.com';
  if (!/^[a-z0-9.]+$/.test(local)) return 'Tên email chỉ được chứa chữ cái (a-z, không dấu), số (0-9) và dấu chấm';
  if (local.length < 6) return 'Tên email phải có ít nhất 6 ký tự';
  if (local.length > 30) return 'Tên email không được vượt quá 30 ký tự';
  if (local.startsWith('.') || local.endsWith('.')) return 'Tên email không được bắt đầu hoặc kết thúc bằng dấu chấm';
  if (local.includes('..')) return 'Tên email không được có 2 dấu chấm liền nhau';
  return '';
};

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

const Register = () => {
  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwActive, setPwActive] = useState(false);
  const [confirmActive, setConfirmActive] = useState(false);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [resendIn, setResendIn] = useState(0);
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const otpRefs = useRef([]);
  const pwStrong = PASSWORD_RULES.every(r => r.test(form.password));

  useEffect(() => {
    if (step !== 'otp' || secondsLeft <= 0) return;
    const timer = setInterval(() => setSecondsLeft(s => s - 1), 1000);
    return () => clearInterval(timer);
  }, [step, secondsLeft]);

  useEffect(() => {
    if (step !== 'otp' || resendIn <= 0) return;
    const timer = setInterval(() => setResendIn(s => s - 1), 1000);
    return () => clearInterval(timer);
  }, [step, resendIn]);

  const formatTime = (s) => `${Math.floor(s / 60)} phút ${String(s % 60).padStart(2, '0')} giây`;

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');

    const cleanName = normalizeName(form.name);
    if (!cleanName) { setError('Vui lòng nhập họ và tên'); return; }
    if (cleanName.length < 2) { setError('Họ tên phải có ít nhất 2 ký tự'); return; }
    if (cleanName.length > 30) { setError('Họ tên không được vượt quá 30 ký tự'); return; }
    if (!NAME_REGEX.test(cleanName)) { setError('Họ tên chỉ được chứa chữ cái và khoảng trắng'); return; }

    const cleanEmail = form.email.trim().toLowerCase();
    const emailErr = getEmailError(cleanEmail);
    if (emailErr) { setError(emailErr); return; }

    if (!form.phone) { setError('Vui lòng nhập số điện thoại'); return; }
    const phoneErr = getPhoneError(form.phone);
    if (phoneErr) { setError(phoneErr); return; }

    if (!form.password) { setError('Vui lòng nhập mật khẩu'); return; }
    if (form.password.length < 8) { setError('Mật khẩu phải có ít nhất 8 ký tự'); return; }
    if (form.password.length > 64) { setError('Mật khẩu không được vượt quá 64 ký tự'); return; }
    if (/[^\x00-\x7F]/.test(form.password)) { setError('Mật khẩu không được chứa dấu tiếng Việt hoặc ký tự có dấu'); return; }
    if (!/[A-Z]/.test(form.password)) { setError('Mật khẩu phải có ít nhất 1 chữ hoa'); return; }
    if (!/[a-z]/.test(form.password)) { setError('Mật khẩu phải có ít nhất 1 chữ thường'); return; }
    if (!/[0-9]/.test(form.password)) { setError('Mật khẩu phải có ít nhất 1 chữ số'); return; }
    if (!SPECIAL_REGEX.test(form.password)) { setError('Mật khẩu phải có ít nhất 1 ký tự đặc biệt'); return; }
    if (!confirmPassword) { setError('Vui lòng nhập lại mật khẩu'); return; }
    if (form.password !== confirmPassword) { setError('Mật khẩu nhập lại không khớp'); return; }

    setLoading(true);
    try {
      const res = await requestRegisterOtp({ ...form, name: cleanName, email: cleanEmail });
      setSecondsLeft(res.data.expiresInSeconds || 300);
      setStep('otp');
      setResendIn(60);
      setOtp('');
    } catch (err) {
      setError(err.response?.data?.message || 'Gửi mã xác thực thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!otp.trim()) { setError('Vui lòng nhập mã xác thực'); return; }
    if (!/^[0-9]+$/.test(otp)) { setError('Mã xác thực chỉ được chứa chữ số'); return; }
    if (otp.length !== 6) { setError('Vui lòng nhập đủ 6 số'); return; }
    setLoading(true);
    try {
      const res = await verifyRegisterOtp({ email: form.email.trim().toLowerCase(), otp });
      loginUser(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      if (err.response?.status === 429) { setSecondsLeft(0); setResendIn(0); setOtp(''); }
      setError(err.response?.data?.message || 'Xác thực thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await requestRegisterOtp({ ...form, name: normalizeName(form.name), email: form.email.trim().toLowerCase() });
      setSecondsLeft(res.data.expiresInSeconds || 300);
      setResendIn(60);
      setOtp('');
    } catch (err) {
      if (err.response?.status === 429 && err.response.data?.retryAfterSeconds) setResendIn(err.response.data.retryAfterSeconds);
      setError(err.response?.data?.message || 'Gửi lại mã thất bại');
    } finally {
      setLoading(false);
    }
  };

  // ===== Xử lý 6 ô nhập mã OTP =====
  const focusOtp = (i) => {
    const el = otpRefs.current[i];
    if (el) el.focus();
  };

  const handleOtpChange = (i, e) => {
    const raw = e.target.value;
    if (raw === '') return; // xóa được xử lý ở onKeyDown
    const digits = raw.replace(/\D/g, '');
    if (!digits) { setError('Mã xác thực chỉ được chứa chữ số'); return; }
    setError('');
    const arr = otp.split('');
    arr[i] = digits.slice(-1);
    setOtp(arr.join('').slice(0, 6));
    if (i < 5) focusOtp(i + 1);
  };

  const handleOtpKeyDown = (i, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (otp[i]) {
        setOtp(otp.slice(0, i) + otp.slice(i + 1));
      } else if (i > 0) {
        setOtp(otp.slice(0, i - 1) + otp.slice(i));
        focusOtp(i - 1);
      }
    } else if (e.key === 'ArrowLeft' && i > 0) {
      focusOtp(i - 1);
    } else if (e.key === 'ArrowRight' && i < 5) {
      focusOtp(i + 1);
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!digits) { setError('Mã xác thực chỉ được chứa chữ số'); return; }
    setError('');
    setOtp(digits);
    focusOtp(Math.min(digits.length, 5));
  };

  const handleOtpFocus = (i, e) => {
    const firstEmpty = Math.min(otp.length, 5);
    if (i > firstEmpty) focusOtp(firstEmpty);
    else e.target.select();
  };

  const eyeButtonStyle = (visible) => ({
    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#555', display: 'flex',
    opacity: visible ? 1 : 0, pointerEvents: visible ? 'auto' : 'none', transition: 'opacity 0.15s'
  });

  return (
    <div className="auth-page">
      <div className="auth-card">
        {step === 'form' ? (
          <>
            <h1 className="auth-title">ĐĂNG KÝ</h1>
            <p className="auth-subtitle">Tạo tài khoản để bắt đầu mua sắm!</p>

            {error && (
              <div style={{ background: '#FFEBEE', color: '#c62828', padding: '12px 16px', borderRadius: 10, marginBottom: 20, fontSize: 15 }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSendOtp} noValidate>
              <div className="form-group">
                <label>Họ tên *</label>
                <input placeholder="Nhập họ tên" value={form.name}
                  style={normalizeName(form.name).length > 30 ? { borderColor: '#c62828' } : {}}
                  onChange={e => setForm({ ...form, name: e.target.value })} required />
                {normalizeName(form.name).length > 30 && (
                  <small style={{ color: '#c62828', display: 'block', marginTop: 4 }}>
                    Họ tên không được vượt quá 30 ký tự (hiện tại: {normalizeName(form.name).length})
                  </small>
                )}
              </div>

              <div className="form-group">
                <label>Số điện thoại *</label>
                <input type="tel" placeholder="Nhập số điện thoại" value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })} required />
              </div>

              <div className="form-group">
                <label>Địa chỉ Email (Gmail) *</label>
                <input type="text" placeholder="Nhập địa chỉ Gmail" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>

              <div className="form-group">
                <label>Mật khẩu *</label>
                <div style={{ position: 'relative' }}
                  onMouseEnter={() => setPwActive(true)} onMouseLeave={() => setPwActive(false)}
                  onFocus={() => setPwActive(true)} onBlur={() => setPwActive(false)}>
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    style={eyeButtonStyle(pwActive)}>
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                  <input type={showPassword ? 'text' : 'password'} placeholder="Từ 8 đến 64 ký tự" value={form.password}
                    style={{ paddingRight: 44 }}
                    onChange={e => setForm({ ...form, password: e.target.value })} required />
                </div>
                                                {form.password.length > 0 && (
                  <div style={{ marginTop: 8, fontSize: 13 }}>
                    <div style={{ fontWeight: 600, color: pwStrong ? '#2e7d32' : '#c62828' }}>
                      {pwStrong ? '✓ Mật khẩu đủ mạnh' : 'Mật khẩu chưa đủ mạnh '}
                    </div>
                    <div style={{ marginTop: 4, lineHeight: 1.7 }}>
                                            {PASSWORD_RULES.map((r, idx) => {
                        const ok = r.test(form.password);
                        return (
                          <span key={r.label} style={{ color: ok ? '#2e7d32' : '#c62828' }}>
                            {idx > 0 && <span style={{ color: '#999' }}> - </span>}
                            {ok ? '✓ ' : ''}{r.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Nhập lại mật khẩu *</label>
                <div style={{ position: 'relative' }}
                  onMouseEnter={() => setConfirmActive(true)} onMouseLeave={() => setConfirmActive(false)}
                  onFocus={() => setConfirmActive(true)} onBlur={() => setConfirmActive(false)}>
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    title={showConfirm ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    style={eyeButtonStyle(confirmActive)}>
                    {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                  <input type={showConfirm ? 'text' : 'password'} placeholder="Nhập lại mật khẩu" value={confirmPassword}
                    style={{ paddingRight: 44 }}
                    onChange={e => setConfirmPassword(e.target.value)} required />
                </div>
              </div>

              <button type="submit" className="btn btn-accent" style={{ width: '100%', padding: '14px', fontSize: 16, marginTop: 8 }} disabled={loading}>
                {loading ? 'Đang gửi mã...' : 'Tạo tài khoản'}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="auth-title" style={{ fontSize: 30, whiteSpace: 'nowrap', textAlign: 'center' }}>NHẬP MÃ XÁC THỰC</h1>
            <p className="auth-subtitle" style={{ textAlign: 'center' }}>
              Mã xác thực được gửi đến {form.email}<br />
              {secondsLeft > 0
                ? <>Có hiệu lực trong {formatTime(secondsLeft)}</>
                : <span style={{ color: '#c62828' }}>Mã đã hết hạn<br />(Vui lòng ấn gửi lại mã để nhập mã mới)</span>}
            </p>

            <form onSubmit={handleVerifyOtp} noValidate>
              <div className="form-group">
                <label>Mã OTP (6 số) *</label>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                  {[0, 1, 2, 3, 4, 5].map(i => (
                    <input
                      key={i}
                      ref={el => (otpRefs.current[i] = el)}
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      autoFocus={i === 0}
                      aria-label={`Số thứ ${i + 1}`}
                      value={otp[i] || ''}
                      onChange={e => handleOtpChange(i, e)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      onPaste={handleOtpPaste}
                      onFocus={e => handleOtpFocus(i, e)}
                      style={{ flex: '1 1 0', maxWidth: 52, minWidth: 0, height: 56, padding: 0, textAlign: 'center', fontSize: 24, fontWeight: 600, borderRadius: 10 }}
                    />
                  ))}
                </div>
                <div style={{ minHeight: 44, marginTop: 8 }}>
                  {error && (
                    <small style={{ color: '#c62828', display: 'block', fontSize: 14 }}>
                      ⚠️ {error}
                    </small>
                  )}
                </div>
              </div>

              <button type="submit" className="btn btn-accent" style={{ width: '100%', padding: '14px', fontSize: 16, marginTop: 8 }} disabled={loading || secondsLeft <= 0}>
                {loading ? 'Đang xác thực...' : 'Xác nhận'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: 16, fontSize: 15 }}>
              {resendIn <= 0 ? (
                <span onClick={loading ? undefined : handleResend} style={{ color: 'var(--accent)', fontWeight: 600, cursor: 'pointer' }}>Gửi lại mã</span>
              ) : (
                <span style={{ color: '#aaa' }}>Chưa nhận được mã? Gửi lại mã sau {resendIn} giây</span>
              )}
            </p>
          </>
        )}

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 15, color: '#888' }}>
          Đã có tài khoản? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;