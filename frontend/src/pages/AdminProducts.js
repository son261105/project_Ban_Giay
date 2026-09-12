import React, { useEffect, useState } from 'react';
import { AdminLayout } from './AdminDashboard';
import { getProducts, getBrands, getCategories, createProduct, updateProduct, deleteProduct } from '../services/api';

const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

const SIZES = ['35','36','37','38','39','40','41','42','43','44','45','46'];

const defaultForm = { name: '', description: '', price: '', brand_id: '', category_id: '', image_url: '' };

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [stockBySize, setStockBySize] = useState({}); // { size: quantity }
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [pRes, bRes, cRes] = await Promise.all([
        getProducts({ limit: 100 }),
        getBrands(),
        getCategories()
      ]);
      setProducts(pRes.data.products);
      setBrands(bRes.data.brands);
      setCategories(cRes.data.categories);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => {
    setEditProduct(null);
    setForm(defaultForm);
    setStockBySize({});
    setShowModal(true);
  };

  const openEdit = async (p) => {
    setEditProduct(p);
    setForm({
      name: p.name, description: p.description || '',
      price: p.price, brand_id: p.brand_id || '',
      category_id: p.category_id || '', image_url: p.image_url || ''
    });
    // Load full product with stock_by_size
    try {
      const { getProduct } = await import('../services/api');
      const res = await getProduct(p.id);
      const sbs = {};
      (res.data.product.stock_by_size || []).forEach(s => { sbs[s.size] = s.quantity; });
      setStockBySize(sbs);
    } catch { setStockBySize({}); }
    setShowModal(true);
  };

  const toggleSize = (size) => {
    setStockBySize(prev => {
      const next = { ...prev };
      if (next[size] !== undefined) delete next[size];
      else next[size] = 0;
      return next;
    });
  };

  const setQtyForSize = (size, qty) => {
    setStockBySize(prev => ({ ...prev, [size]: parseInt(qty) || 0 }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const stock_by_size = Object.entries(stockBySize).map(([size, quantity]) => ({ size, quantity }));
      const data = { ...form, price: parseFloat(form.price), brand_id: form.brand_id || null, category_id: form.category_id || null, stock_by_size };
      if (editProduct) await updateProduct(editProduct.id, data);
      else await createProduct(data);
      setShowModal(false);
      setMsg(editProduct ? '✅ Cập nhật thành công!' : '✅ Thêm sản phẩm thành công!');
      await fetchAll();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.message || 'Lỗi'));
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Xóa sản phẩm "${name}"?`)) return;
    try {
      await deleteProduct(id);
      setMsg('✅ Đã xóa sản phẩm!');
      await fetchAll();
      setTimeout(() => setMsg(''), 3000);
    } catch { setMsg('❌ Lỗi khi xóa'); }
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout>
      <div className="page-header">
        <h1 className="page-title">QUẢN LÝ SẢN PHẨM</h1>
        <button className="btn btn-accent" onClick={openCreate}>+ Thêm sản phẩm</button>
      </div>

      {msg && (
        <div style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 20, fontSize: 14,
          background: msg.startsWith('✅') ? '#E8F5E9' : '#FFEBEE',
          color: msg.startsWith('✅') ? '#2E7D32' : '#c62828' }}>{msg}</div>
      )}

      <div style={{ marginBottom: 20 }}>
        <input placeholder="🔍 Tìm sản phẩm..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ padding: '10px 16px', border: '2px solid var(--border)', borderRadius: 10, fontSize: 14, width: 300 }} />
      </div>

      {loading ? <div className="loading"><div className="spinner"></div></div> : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Hình ảnh</th><th>Tên sản phẩm</th><th>Thương hiệu</th>
                <th>Giá</th><th>Tổng kho</th><th>Danh mục</th><th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td style={{ color: '#888', fontWeight: 600 }}>#{p.id}</td>
                  <td>
                    <img src={p.image_url} alt={p.name}
                      style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 8 }}
                      onError={e => { e.target.src = 'https://via.placeholder.com/52?text=?'; }} />
                  </td>
                  <td style={{ fontWeight: 600, maxWidth: 200 }}>{p.name}</td>
                  <td>{p.brand_name}</td>
                  <td style={{ fontWeight: 600, color: 'var(--accent)' }}>{formatPrice(p.price)}</td>
                  <td>
                    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                      background: p.stock > 0 ? '#E8F5E9' : '#FFEBEE',
                      color: p.stock > 0 ? '#2E7D32' : '#c62828' }}>{p.stock}</span>
                  </td>
                  <td style={{ fontSize: 13, color: '#888' }}>{p.category_name || p.category_slug}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-outline btn-sm" onClick={() => openEdit(p)}> Sửa</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id, p.name)}>🗑 Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>Không có sản phẩm nào</div>}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal" style={{ maxWidth: 700, maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h2>{editProduct ? 'SỬA SẢN PHẨM' : 'THÊM SẢN PHẨM'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Tên sản phẩm *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label>Giá (VNĐ) *</label>
                  <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Thương hiệu</label>
                  <select value={form.brand_id} onChange={e => setForm({ ...form, brand_id: e.target.value })}>
                    <option value="">Chọn thương hiệu</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label>Danh mục</label>
                  <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}>
                    <option value="">Chọn danh mục</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>URL hình ảnh</label>
                  <input value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
                </div>
              </div>
              <div className="form-group">
                <label>Mô tả</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} />
              </div>

              {/* Stock per size */}
              <div className="form-group">
                <label style={{ fontWeight: 700 }}>Tồn kho theo size</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                  {SIZES.map(size => (
                    <button key={size} type="button"
                      className={`size-btn ${stockBySize[size] !== undefined ? 'selected' : ''}`}
                      onClick={() => toggleSize(size)}>{size}</button>
                  ))}
                </div>
                {Object.keys(stockBySize).sort((a,b) => parseInt(a)-parseInt(b)).length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {Object.keys(stockBySize).sort((a,b) => parseInt(a)-parseInt(b)).map(size => (
                      <div key={size} style={{ display: 'flex', alignItems: 'center', gap: 4,
                        background: '#f5f5f5', borderRadius: 8, padding: '4px 10px', fontSize: 13 }}>
                        <span style={{ fontWeight: 600 }}>Size {size}:</span>
                        <input type="number" min="0" value={stockBySize[size]}
                          onChange={e => setQtyForSize(size, e.target.value)}
                          style={{ width: 60, border: '1px solid #ddd', borderRadius: 4, padding: '2px 6px' }} />
                        <span>đôi</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="submit" className="btn btn-accent" style={{ flex: 1 }} disabled={saving}>
                  {saving ? 'Đang lưu...' : (editProduct ? 'Cập nhật' : 'Thêm sản phẩm')}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminProducts;
