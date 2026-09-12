import React, { useEffect, useState } from 'react';
import { AdminLayout } from './AdminDashboard';
import { getSuppliers, createSupplier, getImportReceipts, createImportReceipt, getLowStock, getStockOverview, getProducts, getBrands } from '../services/api';

const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

const SIZES = ['35','36','37','38','39','40','41','42','43','44','45','46'];

const AdminInventory = () => {
  const [tab, setTab] = useState('stock');
  const [stockOverview, setStockOverview] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  // Supplier form
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [supplierForm, setSupplierForm] = useState({ name: '', email: '', phone: '', address: '' });

  // Receipt form
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptForm, setReceiptForm] = useState({ supplier_id: '', note: '' });
  const [receiptItems, setReceiptItems] = useState([{ product_id: '', size: '', quantity: 1, cost_price: 0 }]);

  const showMsg = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const loadData = async () => {
    setLoading(true);
    try {
      const [soRes, lsRes, supRes, recRes, pRes] = await Promise.all([
        getStockOverview(), getLowStock(5), getSuppliers(), getImportReceipts(), getProducts({ limit: 200 })
      ]);
      setStockOverview(soRes.data.overview);
      setLowStock(lsRes.data.items);
      setSuppliers(supRes.data.suppliers);
      setReceipts(recRes.data.receipts);
      setProducts(pRes.data.products);
    } catch (err) { showMsg('❌ ' + err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleCreateSupplier = async (e) => {
    e.preventDefault();
    try {
      await createSupplier(supplierForm);
      setShowSupplierModal(false);
      setSupplierForm({ name: '', email: '', phone: '', address: '' });
      showMsg('✅ Thêm nhà cung cấp thành công!');
      loadData();
    } catch (err) { showMsg('❌ ' + (err.response?.data?.message || err.message)); }
  };

  const addReceiptItem = () => setReceiptItems(prev => [...prev, { product_id: '', size: '', quantity: 1, cost_price: 0 }]);
  const removeReceiptItem = (i) => setReceiptItems(prev => prev.filter((_, idx) => idx !== i));
  const updateReceiptItem = (i, field, val) => setReceiptItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: val } : item));

  const handleCreateReceipt = async (e) => {
    e.preventDefault();
    try {
      await createImportReceipt({
        supplier_id: receiptForm.supplier_id || null,
        note: receiptForm.note,
        items: receiptItems.map(i => ({ ...i, quantity: parseInt(i.quantity), cost_price: parseFloat(i.cost_price) }))
      });
      setShowReceiptModal(false);
      setReceiptForm({ supplier_id: '', note: '' });
      setReceiptItems([{ product_id: '', size: '', quantity: 1, cost_price: 0 }]);
      showMsg('✅ Tạo phiếu nhập thành công!');
      loadData();
    } catch (err) { showMsg('❌ ' + (err.response?.data?.message || err.message)); }
  };

  const tabs = [
    { key: 'stock', label: ' Tổng quan tồn kho' },
    { key: 'lowstock', label: `⚠️ Sắp hết (${lowStock.length})` },
    { key: 'suppliers', label: ' Nhà cung cấp' },
    { key: 'receipts', label: ' Phiếu nhập' },
  ];

  return (
    <AdminLayout>
      <div className="page-header">
        <h1 className="page-title">QUẢN LÝ KHO</h1>
        {tab === 'suppliers' && <button className="btn btn-accent" onClick={() => setShowSupplierModal(true)}>+ Thêm NCC</button>}
        {tab === 'receipts' && <button className="btn btn-accent" onClick={() => setShowReceiptModal(true)}>+ Tạo phiếu nhập</button>}
      </div>

      {msg && <div style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 16, fontSize: 14,
        background: msg.startsWith('✅') ? '#E8F5E9' : '#FFEBEE',
        color: msg.startsWith('✅') ? '#2E7D32' : '#c62828' }}>{msg}</div>}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '2px solid var(--border)', paddingBottom: 0 }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ padding: '10px 20px', border: 'none', borderBottom: tab === t.key ? '3px solid var(--accent)' : '3px solid transparent',
              background: 'none', cursor: 'pointer', fontWeight: tab === t.key ? 700 : 400,
              color: tab === t.key ? 'var(--accent)' : '#666', fontSize: 14 }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? <div className="loading"><div className="spinner"></div></div> : (
        <>
          {/* Stock Overview */}
          {tab === 'stock' && (
            <div className="table-container">
              <table>
                <thead><tr><th>Sản phẩm</th><th>Thương hiệu</th><th>Tổng kho</th><th>Chi tiết theo size</th></tr></thead>
                <tbody>
                  {stockOverview.map(p => {
                    const sizes = typeof p.stock_by_size === 'string' ? JSON.parse(p.stock_by_size) : p.stock_by_size || [];
                    const validSizes = sizes.filter(s => s.size && s.quantity !== null);
                    return (
                      <tr key={p.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <img src={p.image_url} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }}
                              onError={e => { e.target.src = 'https://via.placeholder.com/40?text=?'; }} />
                            <span style={{ fontWeight: 600 }}>{p.name}</span>
                          </div>
                        </td>
                        <td>{p.brand_name}</td>
                        <td>
                          <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                            background: p.total_stock > 10 ? '#E8F5E9' : p.total_stock > 0 ? '#FFF8E1' : '#FFEBEE',
                            color: p.total_stock > 10 ? '#2E7D32' : p.total_stock > 0 ? '#F57F17' : '#c62828' }}>
                            {p.total_stock}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            {validSizes.map(s => (
                              <span key={s.size} style={{ fontSize: 11, padding: '2px 6px', borderRadius: 6,
                                background: s.quantity <= 3 ? '#FFEBEE' : '#f0f0f0',
                                color: s.quantity <= 3 ? '#c62828' : '#333' }}>
                                {s.size}:{s.quantity}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Low Stock */}
          {tab === 'lowstock' && (
            lowStock.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>✅ Không có sản phẩm nào sắp hết hàng</div>
            ) : (
              <div className="table-container">
                <table>
                  <thead><tr><th>Sản phẩm</th><th>Thương hiệu</th><th>Size</th><th>Còn lại</th></tr></thead>
                  <tbody>
                    {lowStock.map(item => (
                      <tr key={item.id}>
                        <td style={{ fontWeight: 600 }}>{item.product_name}</td>
                        <td>{item.brand_name}</td>
                        <td><span style={{ background: '#FFF8E1', padding: '3px 10px', borderRadius: 20, fontWeight: 600 }}>Size {item.size}</span></td>
                        <td>
                          <span style={{ background: item.quantity === 0 ? '#FFEBEE' : '#FFF8E1',
                            color: item.quantity === 0 ? '#c62828' : '#F57F17',
                            padding: '3px 10px', borderRadius: 20, fontWeight: 700 }}>
                            {item.quantity === 0 ? 'HẾT HÀNG' : `${item.quantity} đôi`}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {/* Suppliers */}
          {tab === 'suppliers' && (
            <div className="table-container">
              <table>
                <thead><tr><th>Tên NCC</th><th>Email</th><th>SĐT</th><th>Địa chỉ</th></tr></thead>
                <tbody>
                  {suppliers.map(s => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 600 }}>{s.name}</td>
                      <td>{s.email}</td><td>{s.phone}</td><td>{s.address}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {suppliers.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>Chưa có nhà cung cấp</div>}
            </div>
          )}

          {/* Import Receipts */}
          {tab === 'receipts' && (
            <div>
              {receipts.map(r => (
                <div key={r.id} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ fontWeight: 700 }}>Phiếu #{r.id} — {r.supplier_name || 'Không có NCC'}</div>
                    <div style={{ color: '#888', fontSize: 13 }}>{new Date(r.created_at).toLocaleString('vi-VN')}</div>
                  </div>
                  {r.note && <div style={{ color: '#666', marginBottom: 8, fontSize: 13 }}>Ghi chú: {r.note}</div>}
                  <div style={{ fontWeight: 700, color: 'var(--accent)', marginBottom: 8 }}>Tổng: {formatPrice(r.total_cost)}</div>
                  <table style={{ width: '100%', fontSize: 13 }}>
                    <thead><tr style={{ background: '#222', color: 'white' }}><th style={{ padding: '8px 12px', textAlign: 'left' }}>Sản phẩm</th><th style={{ padding: '8px 12px', textAlign: 'center' }}>Size</th><th style={{ padding: '8px 12px', textAlign: 'center' }}>SL</th><th style={{ padding: '8px 12px', textAlign: 'right' }}>Giá nhập</th></tr></thead>
                    <tbody>
                      {(r.items || []).map((item, i) => (
                        <tr key={i}><td style={{ padding: '4px 8px' }}>{item.product_name}</td><td style={{ textAlign: 'center' }}>{item.size}</td><td style={{ textAlign: 'center' }}>{item.quantity}</td><td style={{ textAlign: 'right' }}>{formatPrice(item.cost_price)}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
              {receipts.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>Chưa có phiếu nhập</div>}
            </div>
          )}
        </>
      )}

      {/* Supplier Modal */}
      {showSupplierModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowSupplierModal(false); }}>
          <div className="modal">
            <div className="modal-header"><h2>THÊM NHÀ CUNG CẤP</h2><button className="modal-close" onClick={() => setShowSupplierModal(false)}>×</button></div>
            <form onSubmit={handleCreateSupplier}>
              <div className="form-group"><label>Tên NCC *</label><input value={supplierForm.name} onChange={e => setSupplierForm({...supplierForm, name: e.target.value})} required /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group"><label>Email</label><input value={supplierForm.email} onChange={e => setSupplierForm({...supplierForm, email: e.target.value})} /></div>
                <div className="form-group"><label>SĐT</label><input value={supplierForm.phone} onChange={e => setSupplierForm({...supplierForm, phone: e.target.value})} /></div>
              </div>
              <div className="form-group"><label>Địa chỉ</label><input value={supplierForm.address} onChange={e => setSupplierForm({...supplierForm, address: e.target.value})} /></div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="submit" className="btn btn-accent" style={{ flex: 1 }}>Thêm NCC</button>
                <button type="button" className="btn btn-outline" onClick={() => setShowSupplierModal(false)}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowReceiptModal(false); }}>
          <div className="modal" style={{ maxWidth: 700, maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header"><h2>TẠO PHIẾU NHẬP KHO</h2><button className="modal-close" onClick={() => setShowReceiptModal(false)}>×</button></div>
            <form onSubmit={handleCreateReceipt}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label>Nhà cung cấp</label>
                  <select value={receiptForm.supplier_id} onChange={e => setReceiptForm({...receiptForm, supplier_id: e.target.value})}>
                    <option value="">Chọn NCC</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Ghi chú</label><input value={receiptForm.note} onChange={e => setReceiptForm({...receiptForm, note: e.target.value})} /></div>
              </div>
              <div style={{ fontWeight: 700, marginBottom: 12 }}>Chi tiết hàng nhập:</div>
              {receiptItems.map((item, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr auto', gap: 8, marginBottom: 8, alignItems: 'end' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    {i === 0 && <label>Sản phẩm</label>}
                    <select value={item.product_id} onChange={e => updateReceiptItem(i, 'product_id', e.target.value)}>
                      <option value="">Chọn SP</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    {i === 0 && <label>Size</label>}
                    <select value={item.size} onChange={e => updateReceiptItem(i, 'size', e.target.value)}>
                      <option value="">Size</option>
                      {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    {i === 0 && <label>SL</label>}
                    <input type="number" min="1" value={item.quantity} onChange={e => updateReceiptItem(i, 'quantity', e.target.value)} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    {i === 0 && <label>Giá nhập</label>}
                    <input type="number" min="0" value={item.cost_price} onChange={e => updateReceiptItem(i, 'cost_price', e.target.value)} />
                  </div>
                  <button type="button" onClick={() => removeReceiptItem(i)}
                    style={{ background: '#FFEBEE', color: '#c62828', border: 'none', borderRadius: 6, padding: '8px 10px', cursor: 'pointer', marginBottom: 4 }}>✕</button>
                </div>
              ))}
              <button type="button" className="btn btn-outline btn-sm" onClick={addReceiptItem} style={{ marginBottom: 16 }}>+ Thêm sản phẩm</button>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="submit" className="btn btn-accent" style={{ flex: 1 }}>Tạo phiếu nhập</button>
                <button type="button" className="btn btn-outline" onClick={() => setShowReceiptModal(false)}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminInventory;
