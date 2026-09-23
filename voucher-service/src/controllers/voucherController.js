const pool = require('../config/database');

const checkOne = (v, order_amount) => {
  const today = new Date().toISOString().split('T')[0];
  if (!v.is_active) return { ok: false, message: `${v.code}: Voucher đã bị vô hiệu hóa` };
  if (today < v.start_date) return { ok: false, message: `${v.code}: Voucher chưa đến ngày sử dụng` };
  if (today > v.end_date) return { ok: false, message: `${v.code}: Voucher đã hết hạn` };
  if (v.max_uses !== null && v.used_count >= v.max_uses) return { ok: false, message: `${v.code}: Voucher đã hết lượt sử dụng` };
  if (order_amount < v.min_order_amount) return { ok: false, message: `${v.code}: Đơn hàng tối thiểu ${new Intl.NumberFormat('vi-VN').format(v.min_order_amount)}đ` };

  let discount = 0;
  if (v.type === 'percent') discount = Math.round(order_amount * v.value / 100);
  if (v.type === 'freeship') discount = 35000;

  return { ok: true, voucher: { id: v.id, code: v.code, type: v.type, value: parseFloat(v.value), discount, description: v.description } };};

const validateVoucher = async (req, res) => {
  const { code, codes, order_amount } = req.body;
  const codeList = (Array.isArray(codes) ? codes : (code ? [code] : []))
    .map(c => String(c).trim().toUpperCase())
    .filter(Boolean);

  if (codeList.length === 0) return res.status(400).json({ success: false, message: 'Vui lòng chọn ít nhất một mã voucher' });

  try {
    const [rows] = await pool.query('SELECT * FROM vouchers WHERE code IN (?)', [codeList]);
    const found = new Map(rows.map(v => [v.code, v]));

    if (!Array.isArray(codes)) {
      const single = codeList[0];
      const v = found.get(single);
      if (!v) return res.status(404).json({ success: false, message: 'Mã voucher không tồn tại' });
      const result = checkOne(v, order_amount);
      if (!result.ok) return res.status(400).json({ success: false, message: result.message });
      return res.json({ success: true, voucher: result.voucher });
    }

    const valid = [];
    const invalid = [];
    for (const c of codeList) {
      const v = found.get(c);
      if (!v) { invalid.push({ code: c, message: `${c}: Mã voucher không tồn tại` }); continue; }
      const result = checkOne(v, order_amount);
      if (result.ok) valid.push(result.voucher); else invalid.push({ code: c, message: result.message });
    }

    let freeshipCounted = false;
    let totalDiscount = 0;
    for (const v of valid) {
      if (v.type === 'freeship') {
        if (freeshipCounted) { v.discount = 0; v.note = 'Đã áp dụng miễn phí ship từ mã khác'; continue; }
        freeshipCounted = true;
      }
      totalDiscount += v.discount;
    }
    totalDiscount = Math.min(totalDiscount, order_amount);

    res.json({ success: true, vouchers: valid, invalid, totalDiscount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const useVoucher = async (req, res) => {
  const { code, codes } = req.body;
  const codeList = (Array.isArray(codes) ? codes : (code ? [code] : []))
    .map(c => String(c).trim().toUpperCase())
    .filter(Boolean);
  try {
    if (codeList.length > 0) {
      await pool.query('UPDATE vouchers SET used_count = used_count + 1 WHERE code IN (?)', [codeList]);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin: lấy danh sách
// Khách hàng (public): lấy danh sách voucher đang hiệu lực để hiển thị ở trang chủ
const getPublicVouchers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT code, type, value, min_order_amount, end_date, description
       FROM vouchers
       WHERE is_active = 1
         AND CURDATE() BETWEEN start_date AND end_date
         AND (max_uses IS NULL OR used_count < max_uses)
       ORDER BY created_at DESC`
    );
        const clean = rows.map(v => ({ ...v, value: parseFloat(v.value), min_order_amount: parseFloat(v.min_order_amount) }));
    res.json({ success: true, vouchers: clean });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin: lấy danh sách
const getAllVouchers = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vouchers ORDER BY created_at DESC');
        const clean = rows.map(v => ({ ...v, value: parseFloat(v.value), min_order_amount: parseFloat(v.min_order_amount) }));
    res.json({ success: true, vouchers: clean });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin: tạo voucher
const createVoucher = async (req, res) => {
  const { code, type, value, min_order_amount, max_uses, start_date, end_date, description } = req.body;
  if (!code || !type || !start_date || !end_date) return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc' });
  try {
    await pool.query(
      'INSERT INTO vouchers (code, type, value, min_order_amount, max_uses, start_date, end_date, description) VALUES (?,?,?,?,?,?,?,?)',
      [code.toUpperCase(), type, value || 0, min_order_amount || 0, max_uses || null, start_date, end_date, description || '']
    );
    res.status(201).json({ success: true, message: 'Tạo voucher thành công' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, message: 'Mã voucher đã tồn tại' });
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin: sửa voucher
const updateVoucher = async (req, res) => {
  const { id } = req.params;
  const { type, value, min_order_amount, max_uses, start_date, end_date, description } = req.body;
  try {
    await pool.query(
      'UPDATE vouchers SET type=?, value=?, min_order_amount=?, max_uses=?, start_date=?, end_date=?, description=? WHERE id=?',
      [type, value || 0, min_order_amount || 0, max_uses || null, start_date, end_date, description || '', id]
    );
    res.json({ success: true, message: 'Cập nhật thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin: bật/tắt
const toggleVoucher = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE vouchers SET is_active = NOT is_active WHERE id = ?', [id]);
    res.json({ success: true, message: 'Cập nhật trạng thái thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin: xóa
const deleteVoucher = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM vouchers WHERE id = ?', [id]);
    res.json({ success: true, message: 'Xóa voucher thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { validateVoucher, useVoucher, getPublicVouchers, getAllVouchers, createVoucher, updateVoucher, toggleVoucher, deleteVoucher };