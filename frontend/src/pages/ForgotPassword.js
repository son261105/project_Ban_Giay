import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { requestResetOtp, verifyResetOtp, resetPassword } from '../services/api';

const SPECIAL_REGEX = /[!-/:-@[-`{-~]/;
const PASSWORD_RULES = [
  { label: 'Từ 8 đến 64 ký tự', test: (p) => p.length >= 8 && p.length <= 64 },
  { label: 'Có ít nhất 1 chữ hoa (A-Z)', test: (p) => /[A-Z]/.test(p) },
  { label: 'Có ít nhất 1 chữ thường (a-z)', test: (p) => /[a-z]/.test(p) },
  { label: 'Có ít nhất 1 chữ số (0-9)', test: (p) => /[0-9]/.test(p) },
  { label: 'Có ít nhất 1 ký tự đặc biệt (vd: @ # $ % ! ?)', test: (p) => SPECIAL_REGEX.test(p) },
  { label: 'Không chứa dấu tiếng Việt', test: (p) => p.length > 0 && !/[^\x00-\x7F]/.test(p) },
];

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

const titleStyle = { fontSize: 30, whiteSpace: 'nowrap', textAlign: 'center' };

const ForgotPassword = () => {
  const [step, setStep] = useState('email'); // 'email' | 'otp' | 'reset' | 'done'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwActive, setPwActive] = useState(false);
  const [confirmActive, setConfirmActive] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [resendIn, setResendIn] = useState(0);
  const otpRefs = useRef([]);
  const navigate = useNavigate();
  const pwStrong = PASSWORD_RULES.every(r => r.test(newPassword));

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

  // ===== Bước 1: nhập email =====
  const handleSendRequest = async (e) => {
    e.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!clean) { setError('Vui lòng nhập email'); return; }
    if (/\s/.test(clean)) { setError('Email không được chứa khoảng trắng'); return; }
    if (!/^[^\s@]+@gmail\.com$/.test(clean)) { setError('Email phải đúng định dạng Gmail (vd: ten@gmail.com)'); return; }

    setLoading(true);
    try {
      const res = await requestResetOtp({ email: clean });
      setEmail(clean);
      setSecondsLeft(res.data.expiresInSeconds || 300);
      setResendIn(60);
      setOtp('');
      setError('');
      setStep('otp');
    } catch (err) {
      if (!err.response) { setError('Không thể kết nối tới máy chủ. Vui lòng thử lại.'); }
      else { setError(err.response.data?.message || 'Gửi yêu cầu thất bại'); }
    } finally {
      setLoading(false);
    }
  };

  // ===== Bước 2: nhập OTP =====
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!otp.trim()) { setError('Vui lòng nhập mã xác thực'); return; }
    if (!/^[0-9]+$/.test(otp)) { setError('Mã xác thực chỉ được chứa chữ số'); return; }
    if (otp.length !== 6) { setError('Vui lòng nhập đủ 6 số'); return; }
    setLoading(true);
    try {
      const res = await verifyResetOtp({ email, otp });
      setResetToken(res.data.resetToken);
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      setStep('reset');
    } catch (err) {
      if (err.response?.status === 429) { setSecondsLeft(0); setResendIn(0); setOtp(''); }
      if (!err.response) { setError('Không thể kết nối tới máy chủ. Vui lòng thử lại.'); }
      else { setError(err.response.data?.message || 'Xác thực thất bại'); }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await requestResetOtp({ email });
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

  const focusOtp = (i) => {
    const el = otpRefs.current[i];
    if (el) el.focus();
  };

  const handleOtpChange = (i, e) => {
    const raw = e.target.value;
    if (raw === '') return;
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

  // ===== Bước 3: đặt mật khẩu mới =====
  const handleReset = async (e) => {
    e.preventDefault();
    if (!newPassword) { setError('Vui lòng nhập mật khẩu mới'); return; }
    if (newPassword.length < 8) { setError('Mật khẩu mới phải có ít nhất 8 ký tự'); return; }
    if (newPassword.length > 64) { setError('Mật khẩu mới không được vượt quá 64 ký tự'); return; }
    if (/[^\x00-\x7F]/.test(newPassword)) { setError('Mật khẩu mới không được chứa dấu tiếng Việt hoặc ký tự có dấu'); return; }
    if (!/[A-Z]/.test(newPassword)) { setError('Mật khẩu mới phải có ít nhất 1 chữ hoa'); return; }
    if (!/[a-z]/.test(newPassword)) { setError('Mật khẩu mới phải có ít nhất 1 chữ thường'); return; }
    if (!/[0-9]/.test(newPassword)) { setError('Mật khẩu mới phải có ít nhất 1 chữ số'); return; }
    if (!SPECIAL_REGEX.test(newPassword)) { setError('Mật khẩu mới phải có ít nhất 1 ký tự đặc biệt'); return; }
    if (!confirmPassword) { setError('Vui lòng nhập lại mật khẩu mới'); return; }
    if (newPassword !== confirmPassword) { setError('Mật khẩu nhập lại không khớp'); return; }

    setLoading(true);
    try {
      await resetPassword({ email, resetToken, newPassword });
      setError('');
      setStep('done');
    } catch (err) {
      if (!err.response) {
        setError('Không thể kết nối tới máy chủ. Vui lòng thử lại.');
      } else {
        if (err.response.data?.sessionExpired) {
          setStep('email'); setOtp(''); setResetToken(''); setNewPassword(''); setConfirmPassword('');
        }
        setError(err.response.data?.message || 'Đặt lại mật khẩu thất bại');
      }
    } finally {
      setLoading(false);
    }
  };

  const eyeButtonStyle = (visible) => ({
    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#555', display: 'flex',
    opacity: visible ? 1 : 0, pointerEvents: visible ? 'auto' : 'none', transition: 'opacity 0.15s'
  });

  const errorBox = error && (
    <div style={{ background: '#FFEBEE', color: '#c62828', padding: '12px 16px', borderRadius: 10, marginBottom: 20, fontSize: 15 }}>
      ⚠️ {error}
    </div>
  );

  return (
    <div className="auth-page">
      <div className="auth-card">

        {step === 'email' && (
          <>
            <h1 className="auth-title" style={titleStyle}>QUÊN MẬT KHẨU</h1>
            <p className="auth-subtitle" style={{ textAlign: 'center' }}>Nhập email đã đăng ký để nhận mã xác thực.</p>
            {errorBox}
            <form onSubmit={handleSendRequest} noValidate>
              <div className="form-group">
                <label>Địa chỉ Email (Gmail) *</label>
                <input type="text" placeholder="Nhập địa chỉ Gmail đã đăng ký" value={email}
                  onChange={e => setEmail(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-accent" style={{ width: '100%', padding: '14px', fontSize: 16, marginTop: 8 }} disabled={loading}>
                {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
              </button>
            </form>
          </>
        )}

        {step === 'otp' && (
          <>
            <h1 className="auth-title" style={titleStyle}>NHẬP MÃ XÁC THỰC</h1>
            <p className="auth-subtitle" style={{ textAlign: 'center' }}>
              Mã xác thực được gửi đến {email}<br />
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

        {step === 'reset' && (
          <>
            <h1 className="auth-title" style={titleStyle}>ĐẶT LẠI MẬT KHẨU</h1>
            <p className="auth-subtitle" style={{ textAlign: 'center' }}>Nhập mật khẩu mới cho tài khoản {email}</p>
            {errorBox}
            <form onSubmit={handleReset} noValidate>
              <div className="form-group">
                <label>Mật khẩu mới *</label>
                <div style={{ position: 'relative' }}
                  onMouseEnter={() => setPwActive(true)} onMouseLeave={() => setPwActive(false)}
                  onFocus={() => setPwActive(true)} onBlur={() => setPwActive(false)}>
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    title={showPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    style={eyeButtonStyle(pwActive)}>
                    {showPw ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                  <input type={showPw ? 'text' : 'password'} autoComplete="new-password" placeholder="Từ 8 đến 64 ký tự" value={newPassword}
                    style={{ paddingRight: 44 }}
                    onChange={e => setNewPassword(e.target.value)} required />
                </div>
                {newPassword.length > 0 && (
                  <div style={{ marginTop: 8, fontSize: 13 }}>
                    <div style={{ fontWeight: 600, color: pwStrong ? '#2e7d32' : '#c62828' }}>
                      {pwStrong ? '✓ Mật khẩu đủ mạnh' : 'Mật khẩu chưa đủ mạnh'}
                    </div>
                    <div style={{ marginTop: 4, lineHeight: 1.7 }}>
                      {PASSWORD_RULES.slice(0, 5).map((r, idx) => {
                        const ok = r.test(newPassword);
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
                <label>Nhập lại mật khẩu mới *</label>
                <div style={{ position: 'relative' }}
                  onMouseEnter={() => setConfirmActive(true)} onMouseLeave={() => setConfirmActive(false)}
                  onFocus={() => setConfirmActive(true)} onBlur={() => setConfirmActive(false)}>
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    title={showConfirm ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    style={eyeButtonStyle(confirmActive)}>
                    {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                  <input type={showConfirm ? 'text' : 'password'} autoComplete="new-password" placeholder="Nhập lại mật khẩu mới" value={confirmPassword}
                    style={{ paddingRight: 44 }}
                    onChange={e => setConfirmPassword(e.target.value)} required />
                </div>
              </div>

              <button type="submit" className="btn btn-accent" style={{ width: '100%', padding: '14px', fontSize: 16, marginTop: 8 }} disabled={loading}>
                {loading ? 'Đang cập nhật...' : 'Đặt lại mật khẩu'}
              </button>
            </form>
          </>
        )}

        {step === 'done' && (
          <>
            <div style={{ textAlign: 'center', fontSize: 56, color: '#2e7d32', lineHeight: 1 }}>✓</div>
            <h1 className="auth-title" style={{ ...titleStyle, marginTop: 12 }}>THÀNH CÔNG</h1>
            <p className="auth-subtitle" style={{ textAlign: 'center' }}>
              Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.
            </p>
            <button type="button" className="btn btn-accent" style={{ width: '100%', padding: '14px', fontSize: 16 }} onClick={() => navigate('/login')}>
              Đăng nhập
            </button>
          </>
        )}

        {step !== 'done' && (
          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 15, color: '#888' }}>
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}> Quay lại đăng nhập</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;