import React, { useEffect, useState } from 'react';
import { AdminLayout } from './AdminDashboard';
import { getAdminVouchers, createVoucherAdmin, updateVoucherAdmin, toggleVoucherAdmin, deleteVoucherAdmin } from '../services/api';

const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p) + 'đ';
const formatDate = (d) => new Date(d).toLocaleDateString('vi-VN');

const emptyForm = { code: '', type: 'percent', value: '', min_order_amount: '', max_uses: '', start_date: '', end_date: '', description: '' };

const AdminVouchers = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await getAdminVouchers();
      setVouchers(res.data.vouchers);
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setError(''); setShowModal(true); };
  const openEdit = (v) => {
    setEditing(v);
    setForm({
      code: v.code, type: v.type, value: v.value, min_order_amount: v.min_order_amount,
      max_uses: v.max_uses || '', start_date: v.start_date?.split('T')[0] || '',
      end_date: v.end_date?.split('T')[0] || '', description: v.description || ''
    });
    setError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.code || !form.type || !form.start_date || !form.end_date) return setError('Vui lòng điền đầy đủ thông tin bắt buộc');
    try {
      if (editing) await updateVoucherAdmin(editing.id, form);
      else await createVoucherAdmin(form);
      setSuccess(editing ? 'Cập nhật thành công!' : 'Tạo voucher thành công!');
      setShowModal(false);
      fetch();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleToggle = async (id) => {
    try { await toggleVoucherAdmin(id); fetch(); } catch { }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa voucher này?')) return;
    try { await deleteVoucherAdmin(id); fetch(); } catch { }
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 className="page-title">QUẢN LÝ VOUCHER</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Thêm voucher</button>
      </div>

      {success && <div style={{ background: '#E8F5E9', color: '#2E7D32', padding: '12px 16px', borderRadius: 10, marginBottom: 16 }}>✅ {success}</div>}

      {loading ? <div className="loading"><div className="spinner"></div></div> : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Mã</th><th>Loại</th><th>Giá trị</th><th>Đơn tối thiểu</th>
                <th>Lượt dùng</th><th>Hạn sử dụng</th><th>Trạng thái</th><th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.map(v => (
                <tr key={v.id}>
                  <td style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: 15 }}>{v.code}</td>
                  <td>
                    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                      background: v.type === 'percent' ? '#E3F2FD' : '#E8F5E9',
                      color: v.type === 'percent' ? '#1565C0' : '#2E7D32' }}>
                      {v.type === 'percent' ? `Giảm ${v.value}%` : 'Freeship'}
                    </span>
                  </td>
                  <td>{v.type === 'percent' ? `${v.value}%` : 'Miễn phí vận chuyển'}</td>
                  <td>{formatPrice(v.min_order_amount)}</td>
                  <td>{v.used_count} / {v.max_uses || '∞'}</td>
                  <td style={{ fontSize: 13, color: '#888' }}>{formatDate(v.start_date)} — {formatDate(v.end_date)}</td>
                  <td>
                    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                      background: v.is_active ? '#E8F5E9' : '#FFEBEE',
                      color: v.is_active ? '#2E7D32' : '#c62828' }}>
                      {v.is_active ? 'Hoạt động' : 'Tắt'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-outline btn-sm" onClick={() => openEdit(v)}>Sửa</button>
                      <button className="btn btn-sm" onClick={() => handleToggle(v.id)}
                        style={{ background: v.is_active ? '#FFF8E1' : '#E8F5E9', color: v.is_active ? '#F57F17' : '#2E7D32', border: 'none', borderRadius: 8, cursor: 'pointer', padding: '6px 12px', fontSize: 13 }}>
                        {v.is_active ? 'Tắt' : 'Bật'}
                      </button>
                      <button className="btn btn-sm" onClick={() => handleDelete(v.id)}
                        style={{ background: '#FFEBEE', color: '#c62828', border: 'none', borderRadius: 8, cursor: 'pointer', padding: '6px 12px', fontSize: 13 }}>
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {vouchers.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>Chưa có voucher nào</div>}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: 16, padding: 32, width: 520, maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: 24 }}>{editing ? 'Sửa voucher' : 'Thêm voucher mới'}</h2>

            {error && <div style={{ background: '#FFEBEE', color: '#c62828', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>⚠️ {error}</div>}

            <div className="form-group">
              <label>Mã voucher *</label>
              <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="VD: GIAM10" disabled={!!editing} style={editing ? { background: '#f5f5f5' } : {}} />
            </div>
            <div className="form-group">
              <label>Loại voucher *</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="percent">Giảm theo %</option>
                <option value="freeship">Miễn phí vận chuyển</option>
              </select>
            </div>
            {form.type === 'percent' && (
              <div className="form-group">
                <label>Phần trăm giảm (%) *</label>
                <input type="number" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} placeholder="VD: 10" min="1" max="100" />
              </div>
            )}
            <div className="form-group">
              <label>Đơn hàng tối thiểu (đ)</label>
              <input type="number" value={form.min_order_amount} onChange={e => setForm({ ...form, min_order_amount: e.target.value })} placeholder="VD: 500000" />
            </div>
            <div className="form-group">
              <label>Giới hạn lượt dùng (để trống = không giới hạn)</label>
              <input type="number" value={form.max_uses} onChange={e => setForm({ ...form, max_uses: e.target.value })} placeholder="VD: 100" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label>Ngày bắt đầu *</label>
                <input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Ngày hết hạn *</label>
                <input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label>Mô tả</label>
              <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="VD: Giảm 10% cho đơn từ 500.000đ" />
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave}>
                {editing ? 'Cập nhật' : 'Tạo voucher'}
              </button>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Hủy</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminVouchers;