import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile, changePhone } from '../services/api';
import axios from 'axios';

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
    if (newPassword.length < 8 || newPassword.length > 64)
      return setError('Mật khẩu mới phải từ 8 đến 64 ký tự');
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
            <input type="password" value={phonePassword} onChange={e => setPhonePassword(e.target.value)} placeholder="Nhập mật khẩu để xác nhận" autoComplete="new-password" />
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
            <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Nhập mật khẩu hiện tại" />
          </div>
          <div className="form-group">
            <label>Mật khẩu mới</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Từ 8 đến 64 ký tự" maxLength={64} />          </div>
          <div className="form-group">
            <label>Nhập lại mật khẩu mới</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Nhập lại mật khẩu mới" />
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