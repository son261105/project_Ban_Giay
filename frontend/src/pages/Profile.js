import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile, changePhone } from '../services/api';
import axios from 'axios';
const SPECIAL_REGEX = /[!-/:-@[-`{-~]/;
const PASSWORD_RULES = [
  { label: 'Từ 8 đến 64 ký tự', test: (p) => p.length >= 8 && p.length <= 64 },
  { label: 'Có ít nhất 1 chữ hoa (A-Z)', test: (p) => /[A-Z]/.test(p) },
  { label: 'Có ít nhất 1 chữ thường (a-z)', test: (p) => /[a-z]/.test(p) },
  { label: 'Có ít nhất 1 chữ số (0-9)', test: (p) => /[0-9]/.test(p) },
  { label: 'Có ít nhất 1 ký tự đặc biệt (vd: @ # $ % ! ?)', test: (p) => SPECIAL_REGEX.test(p) },
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

// Ô mật khẩu có nút mắt: chỉ hiện khi rê chuột vào ô (hoặc đang gõ trong ô)
const PasswordInput = ({ value, onChange, placeholder, autoComplete }) => {
  const [show, setShow] = useState(false);
  const [active, setActive] = useState(false);
  return (
    <div style={{ position: 'relative' }}
      onMouseEnter={() => setActive(true)} onMouseLeave={() => setActive(false)}
      onFocus={() => setActive(true)} onBlur={() => setActive(false)}>
      <button type="button" onClick={() => setShow(!show)}
        title={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        style={{
          position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#555', display: 'flex',
          opacity: active ? 1 : 0, pointerEvents: active ? 'auto' : 'none', transition: 'opacity 0.15s'
        }}>
        {show ? <EyeOffIcon /> : <EyeIcon />}
      </button>
      <input type={show ? 'text' : 'password'} value={value} onChange={onChange}
        placeholder={placeholder} autoComplete={autoComplete} style={{ paddingRight: 44 }} />
    </div>
  );
};
const Profile = () => {
  const { user, loginUser } = useAuth();
  const [tab, setTab] = useState('name');
  const [name, setName] = useState(user?.name || '');
    const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [phonePassword, setPhonePassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const lengthOk = newPassword.length >= 8 && newPassword.length <= 64 && !/[^\x00-\x7F]/.test(newPassword);
  const pwStrong = lengthOk && PASSWORD_RULES.every(r => r.test(newPassword));

  const handleChangeName = async () => {
    if (!name.trim()) return setError('Tên không được để trống');
    if (name.trim().length < 2) return setError('Tên phải có ít nhất 2 ký tự');
    if (name.trim().length > 50) return setError('Tên không được quá 50 ký tự');    
    setLoading(true); setError(''); setMessage('');
    try {
      await updateProfile({ name });
      loginUser({ ...user, name }, localStorage.getItem('token'));
      setMessage('Đổi tên thành công!');
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally { setLoading(false); }
  };

    const handleChangePhone = async () => {
    if (!/^0(3|5|7|8|9)[0-9]{8}$/.test(newPhone)) return setError('Số điện thoại phải gồm 10 số và đúng định dạng Việt Nam');
    if (!phonePassword) return setError('Vui lòng nhập mật khẩu hiện tại để xác nhận');
    setLoading(true); setError(''); setMessage('');
    try {
      const res = await changePhone({ newPhone, currentPassword: phonePassword });
      loginUser({ ...user, phone: res.data.phone }, localStorage.getItem('token'));
      setMessage('Đổi số điện thoại thành công!');
      setNewPhone(''); setPhonePassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally { setLoading(false); }
  };



  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword)
      return setError('Vui lòng điền đầy đủ thông tin');
    if (newPassword !== confirmPassword)
      return setError('Mật khẩu mới không khớp');
        if (newPassword.length < 8) return setError('Mật khẩu mới phải có ít nhất 8 ký tự');
    if (newPassword.length > 64) return setError('Mật khẩu mới không được vượt quá 64 ký tự');
    if (/[^\x00-\x7F]/.test(newPassword)) return setError('Mật khẩu mới không được chứa dấu tiếng Việt hoặc ký tự có dấu');
    if (!/[A-Z]/.test(newPassword)) return setError('Mật khẩu mới phải có ít nhất 1 chữ hoa');
    if (!/[a-z]/.test(newPassword)) return setError('Mật khẩu mới phải có ít nhất 1 chữ thường');
    if (!/[0-9]/.test(newPassword)) return setError('Mật khẩu mới phải có ít nhất 1 chữ số');
    if (!SPECIAL_REGEX.test(newPassword)) return setError('Mật khẩu mới phải có ít nhất 1 ký tự đặc biệt');
    setLoading(true); setError(''); setMessage('');
    try {
      await axios.put('http://localhost:8000/api/auth/change-password', {
        currentPassword, newPassword
      }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setMessage('Đổi mật khẩu thành công!');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Mật khẩu hiện tại không đúng');
    } finally { setLoading(false); }
  };

  return (
    <div className="container page" style={{ maxWidth: 500, margin: '60px auto' }}>
      <h1 style={{ marginBottom: 8 }}>Tài khoản của tôi</h1>
      <p style={{ color: '#888', marginBottom: 32 }}>Quản lý thông tin cá nhân</p>

            <div style={{ display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap' }}>
        <button
          className={`btn ${tab === 'name' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => { setTab('name'); setMessage(''); setError(''); }}>
           Đổi tên
        </button>
        <button
          className={`btn ${tab === 'phone' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => { setTab('phone'); setMessage(''); setError(''); }}>
           Đổi số điện thoại
        </button>
        
        <button
          className={`btn ${tab === 'password' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => { setTab('password'); setMessage(''); setError(''); }}>
           Đổi mật khẩu
        </button>
      </div>

      {message && <div style={{ background: '#E8F5E9', color: '#2E7D32', padding: '12px 16px', borderRadius: 10, marginBottom: 20 }}>✅ {message}</div>}
      {error && <div style={{ background: '#FFEBEE', color: '#c62828', padding: '12px 16px', borderRadius: 10, marginBottom: 20 }}>⚠️ {error}</div>}

      {tab === 'name' && (
        <div>
          <div className="form-group">
            <label>Tên hiện tại</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Nhập tên mới" maxLength={50} />
          </div>
          <button className="btn btn-primary" style={{ width: '100%', padding: 14 }}
            onClick={handleChangeName} disabled={loading}>
            {loading ? 'Đang lưu...' : 'Lưu tên mới'}
          </button>
        </div>
      )}

      {tab === 'phone' && (
        <div>
          <div className="form-group">
            <label>Số điện thoại hiện tại</label>
            <input value={user?.phone || 'Chưa cập nhật'} disabled style={{ background: '#f5f5f5' }} />
          </div>
                    <div className="form-group">
            <label>Số điện thoại mới</label>
            <input value={newPhone} onChange={e => setNewPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="Nhập số điện thoại mới" autoComplete="off" name="new-phone-no-autofill" />
          </div>
          <div className="form-group">
            <label>Mật khẩu hiện tại (xác nhận)</label>
            <PasswordInput value={phonePassword} onChange={e => setPhonePassword(e.target.value)} placeholder="Nhập mật khẩu để xác nhận" autoComplete="new-password" />
          </div>
          <button className="btn btn-primary" style={{ width: '100%', padding: 14 }}
            onClick={handleChangePhone} disabled={loading}>
            {loading ? 'Đang lưu...' : 'Lưu số điện thoại mới'}
          </button>
        </div>
      )}



      {tab === 'password' && (
        <div>
          <div className="form-group">
            <label>Mật khẩu hiện tại</label>
            <PasswordInput value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Nhập mật khẩu hiện tại" />
          </div>
                    <div className="form-group">
            <label>Mật khẩu mới</label>
            <PasswordInput value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Từ 8 đến 64 ký tự" />
            {newPassword.length > 0 && (
              <div style={{ marginTop: 8, fontSize: 13 }}>
                <div style={{ fontWeight: 600, color: pwStrong ? '#2e7d32' : '#c62828' }}>
                  {pwStrong ? '✓ Mật khẩu đủ mạnh' : 'Mật khẩu chưa đủ mạnh (8-64 ký tự, không dấu), cần có:'}
                </div>
                <div style={{ marginTop: 4, lineHeight: 1.7 }}>
                  {PASSWORD_RULES.map((r, idx) => {
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
            <label>Nhập lại mật khẩu mới</label>
            <PasswordInput value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Nhập lại mật khẩu mới" />
          </div>
          <button className="btn btn-primary" style={{ width: '100%', padding: 14 }}
            onClick={handleChangePassword} disabled={loading}>
            {loading ? 'Đang lưu...' : 'Đổi mật khẩu'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Profile;