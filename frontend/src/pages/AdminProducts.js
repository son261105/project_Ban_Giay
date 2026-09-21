import React, { useEffect, useState } from 'react';
import { AdminLayout } from './AdminDashboard';
import { getProducts, getBrands, getCategories, createProduct, updateProduct, deleteProduct, uploadProductImages } from '../services/api';
const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

const SIZES = ['35','36','37','38','39','40','41','42','43','44','45','46'];

const defaultForm = { name: '', description: '', description_detail: '', price: '', brand_id: '', category_id: '' };
const MAX_IMAGES = 10;

// Trình soạn thảo văn bản (không cần cài thêm thư viện)
const RichTextEditor = ({ value, onChange }) => {
  const ref = React.useRef(null);
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== (value || '')) ref.current.innerHTML = value || '';
  }, [value]);
  const exec = (cmd, arg) => {
    document.execCommand(cmd, false, arg);
    ref.current.focus();
    onChange(ref.current.innerHTML);
  };
  const Btn = ({ cmd, arg, title, children }) => (
    <button type="button" title={title} onMouseDown={e => e.preventDefault()} onClick={() => exec(cmd, arg)}
      style={{ minWidth: 34, height: 32, border: '1px solid var(--border)', background: '#fff',
        borderRadius: 6, cursor: 'pointer', fontSize: 15 }}>{children}</button>
  );
  return (
    <div style={{ border: '2px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: 8, background: '#fafafa', borderBottom: '1px solid var(--border)' }}>
        <Btn cmd="bold" title="In đậm"><b>B</b></Btn>
        <Btn cmd="italic" title="In nghiêng"><i>I</i></Btn>
        <Btn cmd="underline" title="Gạch chân"><u>U</u></Btn>
        <Btn cmd="formatBlock" arg="<h3>" title="Tiêu đề">H3</Btn>
        <Btn cmd="formatBlock" arg="<p>" title="Đoạn văn">P</Btn>
        <Btn cmd="insertUnorderedList" title="Danh sách chấm">• List</Btn>
        <Btn cmd="insertOrderedList" title="Danh sách số">1. List</Btn>
        <Btn cmd="justifyLeft" title="Căn trái">⬅</Btn>
        <Btn cmd="justifyCenter" title="Căn giữa">↔</Btn>
        <Btn cmd="justifyRight" title="Căn phải">➡</Btn>
        <Btn cmd="removeFormat" title="Xóa định dạng">✕</Btn>
      </div>
      <div ref={ref} contentEditable suppressContentEditableWarning
        onInput={e => onChange(e.currentTarget.innerHTML)}
        style={{ minHeight: 180, padding: 14, fontSize: 15, lineHeight: 1.7, outline: 'none', background: '#fff' }} />
    </div>
  );
};
const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [sizes, setSizes] = useState([]);     // ['38','39',...]
  const [images, setImages] = useState([]);   // danh sách URL ảnh
  const [uploading, setUploading] = useState(false);  const [search, setSearch] = useState('');
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
    setSizes([]);
    setImages([]);    setShowModal(true);
  };

    const openEdit = async (p) => {
    setEditProduct(p);
    setForm({
      name: p.name, description: p.description || '', description_detail: '',
      price: p.price, brand_id: p.brand_id || '', category_id: p.category_id || ''
    });
    try {
      const { getProduct } = await import('../services/api');
      const res = await getProduct(p.id);
      setSizes((res.data.product.stock_by_size || []).map(s => String(s.size)));
      setImages(res.data.product.images || []);
      setForm(f => ({ ...f, description_detail: res.data.product.description_detail || '' }));
    } catch { setSizes([]); setImages([]); }
    setShowModal(true);
  };

    const toggleSize = (size) => {
    setSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  };

  const handleSelectFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (files.length === 0) return;
    if (images.length + files.length > MAX_IMAGES) {
      setMsg(`❌ Tối đa ${MAX_IMAGES} ảnh cho 1 sản phẩm`);
      setTimeout(() => setMsg(''), 3000);
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      files.forEach(f => fd.append('images', f));
      const res = await uploadProductImages(fd);
      setImages(prev => [...prev, ...res.data.urls]);
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.message || 'Lỗi tải ảnh'));
    } finally { setUploading(false); }
  };

  const removeImage = (idx) => setImages(prev => prev.filter((_, i) => i !== idx));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
            const data = { ...form, price: parseFloat(form.price), brand_id: form.brand_id || null, category_id: form.category_id || null, images, sizes };
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
        <div style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 20, fontSize: 15,
          background: msg.startsWith('✅') ? '#E8F5E9' : '#FFEBEE',
          color: msg.startsWith('✅') ? '#2E7D32' : '#c62828' }}>{msg}</div>
      )}

      <div style={{ marginBottom: 20 }}>
        <input placeholder="🔍 Tìm sản phẩm..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ padding: '10px 16px', border: '2px solid var(--border)', borderRadius: 10, fontSize: 15, width: 300 }} />
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
                    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                      background: p.stock > 0 ? '#E8F5E9' : '#FFEBEE',
                      color: p.stock > 0 ? '#2E7D32' : '#c62828' }}>{p.stock}</span>
                  </td>
                  <td style={{ fontSize: 14, color: '#888' }}>{p.category_name || p.category_slug}</td>
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
                            <div className="form-group">
                <label>Danh mục</label>
                <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}>
                  <option value="">Chọn danh mục</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Mô tả ngắn</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} />
              </div>

              {/* Thêm hình ảnh */}
              <div className="form-group">
                <label style={{ fontWeight: 600, fontSize: 17 }}>Thêm hình ảnh (tối đa {MAX_IMAGES} ảnh)</label>
                <label htmlFor="product-images-input"
                  style={{ display: 'block', width: '100%', padding: '28px 16px', marginTop: 8,
                    border: '2px dashed var(--border)', borderRadius: 12, textAlign: 'center',
                    cursor: 'pointer', background: '#fafafa' }}>
                  <div style={{ fontSize: 35, marginBottom: 6 }}>📷</div>
                  <div style={{ fontSize: 17, fontWeight: 600 }}>
                    {uploading ? 'Đang tải ảnh lên...' : 'Chọn tệp ảnh từ máy tính'}
                  </div>
                  <div style={{ fontSize: 14, color: '#888', marginTop: 4 }}>
                    Đã chọn {images.length}/{MAX_IMAGES} ảnh · JPG, PNG · tối đa 5MB mỗi ảnh
                  </div>
                </label>
                <input id="product-images-input" type="file" accept="image/*" multiple
                  onChange={handleSelectFiles} disabled={uploading || images.length >= MAX_IMAGES}
                  style={{ display: 'none' }} />

                {images.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 14 }}>
                    {images.map((url, idx) => (
                      <div key={url + idx} style={{ position: 'relative', width: 96, height: 96 }}>
                        <img src={url} alt={`Ảnh ${idx + 1}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border)' }} />
                        <button type="button" onClick={() => removeImage(idx)} title="Xóa ảnh"
                          style={{ position: 'absolute', top: -8, right: -8, width: 24, height: 24, borderRadius: '50%',
                            border: 'none', background: '#c62828', color: '#fff', cursor: 'pointer', fontSize: 15, lineHeight: '24px' }}>×</button>
                        {idx === 0 && (
                          <span style={{ position: 'absolute', bottom: 4, left: 4, background: 'rgba(0,0,0,.65)',
                            color: '#fff', fontSize: 11, padding: '2px 6px', borderRadius: 4 }}>Ảnh chính</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

                            {/* Chọn size bán */}
              <div className="form-group">
                <label style={{ fontWeight: 600 }}>Size sản phẩm có bán</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {SIZES.map(size => (
                    <button key={size} type="button"
                      className={`size-btn ${sizes.includes(size) ? 'selected' : ''}`}
                      onClick={() => toggleSize(size)}>{size}</button>
                  ))}
                </div>
              </div>

              {/* Mô tả chi tiết */}
              <div className="form-group">
                <label style={{ fontWeight: 600 }}>Mô tả sản phẩm chi tiết</label>
                <RichTextEditor value={form.description_detail}
                  onChange={html => setForm(f => ({ ...f, description_detail: html }))} />
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
