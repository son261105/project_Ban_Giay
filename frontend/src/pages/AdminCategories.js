import React, { useEffect, useState } from 'react';
import { AdminLayout } from './AdminDashboard';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../services/api';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '' });

  const fetchCategories = () => {
    getCategories()
      .then(r => setCategories(r.data.categories || []))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, []);

  const toSlug = (str) => str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const openAdd = () => { setEditCategory(null); setForm({ name: '', slug: '', description: '' }); setShowModal(true); };
  const openEdit = (c) => { setEditCategory(c); setForm({ name: c.name, slug: c.slug, description: c.description || '' }); setShowModal(true); };

  const handleNameChange = (val) => {
    setForm(f => ({ ...f, name: val, slug: editCategory ? f.slug : toSlug(val) }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) return setMsg('❌ Vui lòng nhập tên danh mục');
    if (!form.slug.trim()) return setMsg('❌ Vui lòng nhập slug');
    try {
      if (editCategory) {
        await updateCategory(editCategory.id, form);
        setMsg('✅ Cập nhật danh mục thành công!');
      } else {
        await createCategory(form);
        setMsg('✅ Thêm danh mục thành công!');
      }
      setShowModal(false);
      fetchCategories();
    } catch (e) { setMsg('❌ ' + (e.response?.data?.message || 'Lỗi server')); }
    setTimeout(() => setMsg(''), 3000);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Xóa danh mục "${name}"?`)) return;
    try {
      await deleteCategory(id);
      setMsg('✅ Đã xóa danh mục!');
      fetchCategories();
    } catch (e) { setMsg('❌ ' + (e.response?.data?.message || 'Lỗi server')); }
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <AdminLayout>
      <div className="page-header">
        <h1 className="page-title">QUẢN LÝ DANH MỤC</h1>
        <button className="btn btn-accent" onClick={openAdd}>+ Thêm danh mục</button>
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
                <th>Tên danh mục</th>
                <th>Mô tả</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(c => (
                <tr key={c.id}>
                  <td style={{ color: '#888', fontWeight: 600 }}>#{c.id}</td>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td style={{ color: '#666', fontSize: 13 }}>{c.description || '—'}</td>
                  <td style={{ color: '#888', fontSize: 13 }}>{new Date(c.created_at).toLocaleDateString('vi-VN')}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-outline btn-sm" onClick={() => openEdit(c)}> Sửa</button>
                      <button className="btn btn-sm" style={{ background: '#FFEBEE', color: '#c62828', border: 'none' }} onClick={() => handleDelete(c.id, c.name)}>🗑 Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {categories.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>Chưa có danh mục nào</div>}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: 32, width: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 24, marginBottom: 24 }}>
              {editCategory ? 'SỬA DANH MỤC' : 'THÊM DANH MỤC'}
            </h2>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6, textTransform: 'uppercase' }}>Tên danh mục *</label>
              <input
                className="form-input"
                value={form.name}
                onChange={e => handleNameChange(e.target.value)}
                placeholder="VD: Sneaker, Chạy bộ..."
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6, textTransform: 'uppercase' }}>Mô tả</label>
              <textarea
                className="form-input"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Mô tả danh mục (tùy chọn)"
                rows={3}
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Hủy</button>
              <button className="btn btn-accent" onClick={handleSave}>{editCategory ? 'Lưu thay đổi' : 'Thêm mới'}</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminCategories;
