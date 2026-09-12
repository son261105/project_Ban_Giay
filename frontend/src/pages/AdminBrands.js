import React, { useEffect, useState } from 'react';
import { AdminLayout } from './AdminDashboard';
import { getBrands, createBrand, updateBrand, deleteBrand } from '../services/api';

const AdminBrands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editBrand, setEditBrand] = useState(null);
  const [form, setForm] = useState({ name: '', logo_url: '' });

  const fetchBrands = () => {
    getBrands()
      .then(r => setBrands(r.data.brands || []))
      .catch(() => setBrands([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBrands(); }, []);

  const openAdd = () => { setEditBrand(null); setForm({ name: '', logo_url: '' }); setShowModal(true); };
  const openEdit = (b) => { setEditBrand(b); setForm({ name: b.name, logo_url: b.logo_url || '' }); setShowModal(true); };

  const handleSave = async () => {
    if (!form.name.trim()) return setMsg('❌ Vui lòng nhập tên thương hiệu');
    try {
      if (editBrand) {
        await updateBrand(editBrand.id, form);
        setMsg('✅ Cập nhật thương hiệu thành công!');
      } else {
        await createBrand(form);
        setMsg('✅ Thêm thương hiệu thành công!');
      }
      setShowModal(false);
      fetchBrands();
    } catch (e) { setMsg('❌ ' + (e.response?.data?.message || 'Lỗi server')); }
    setTimeout(() => setMsg(''), 3000);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Xóa thương hiệu "${name}"?`)) return;
    try {
      await deleteBrand(id);
      setMsg('✅ Đã xóa thương hiệu!');
      fetchBrands();
    } catch (e) { setMsg('❌ ' + (e.response?.data?.message || 'Lỗi server')); }
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <AdminLayout>
      <div className="page-header">
        <h1 className="page-title">QUẢN LÝ THƯƠNG HIỆU</h1>
        <button className="btn btn-accent" onClick={openAdd}>+ Thêm thương hiệu</button>
      </div>

      {msg && (
        <div style={{
          padding: '12px 16px', borderRadius: 10, marginBottom: 20, fontSize: 14,
          background: msg.startsWith('✅') ? '#E8F5E9' : '#FFEBEE',
          color: msg.startsWith('✅') ? '#2E7D32' : '#c62828'
        }}>{msg}</div>
      )}

      {loading ? (
        <div className="loading"><div className="spinner"></div></div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Logo</th>
                <th>Tên thương hiệu</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {brands.map(b => (
                <tr key={b.id}>
                  <td style={{ color: '#888', fontWeight: 600 }}>#{b.id}</td>
                  <td>
                    {b.logo_url
                      ? <img src={b.logo_url} alt={b.name} style={{ width: 40, height: 40, objectFit: 'contain' }} onError={e => { e.target.style.display = 'none'; }} />
                      : <span style={{ color: '#ccc', fontSize: 13 }}>—</span>}
                  </td>
                  <td style={{ fontWeight: 600 }}>{b.name}</td>
                  <td style={{ color: '#888', fontSize: 13 }}>{new Date(b.created_at).toLocaleDateString('vi-VN')}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-outline btn-sm" onClick={() => openEdit(b)}> Sửa</button>
                      <button className="btn btn-sm" style={{ background: '#FFEBEE', color: '#c62828', border: 'none' }} onClick={() => handleDelete(b.id, b.name)}>🗑 Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {brands.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>Chưa có thương hiệu nào</div>}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: 32, width: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 24, marginBottom: 24 }}>
              {editBrand ? 'SỬA THƯƠNG HIỆU' : 'THÊM THƯƠNG HIỆU'}
            </h2>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6, textTransform: 'uppercase' }}>Tên thương hiệu *</label>
              <input
                className="form-input"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="VD: Nike, Adidas..."
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6, textTransform: 'uppercase' }}>URL Logo</label>
              <input
                className="form-input"
                value={form.logo_url}
                onChange={e => setForm({ ...form, logo_url: e.target.value })}
                placeholder="https://..."
                style={{ width: '100%' }}
              />
              {form.logo_url && (
                <img src={form.logo_url} alt="preview" style={{ marginTop: 10, width: 60, height: 60, objectFit: 'contain', border: '1px solid #eee', borderRadius: 8 }}
                  onError={e => { e.target.style.display = 'none'; }} />
              )}
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Hủy</button>
              <button className="btn btn-accent" onClick={handleSave}>{editBrand ? 'Lưu thay đổi' : 'Thêm mới'}</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminBrands;
