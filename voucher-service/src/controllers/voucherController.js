const pool = require('../config/database');

// Validate voucher (khách dùng)
const validateVoucher = async (req, res) => {
  const { code, order_amount } = req.body;
  if (!code) return res.status(400).json({ success: false, message: 'Vui lòng nhập mã voucher' });

  try {
    const [rows] = await pool.query('SELECT * FROM vouchers WHERE code = ?', [code.toUpperCase()]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Mã voucher không tồn tại' });

    const v = rows[0];
    const today = new Date().toISOString().split('T')[0];

    if (!v.is_active) return res.status(400).json({ success: false, message: 'Voucher đã bị vô hiệu hóa' });
    if (today < v.start_date) return res.status(400).json({ success: false, message: 'Voucher chưa đến ngày sử dụng' });
    if (today > v.end_date) return res.status(400).json({ success: false, message: 'Voucher đã hết hạn' });
    if (v.max_uses !== null && v.used_count >= v.max_uses) return res.status(400).json({ success: false, message: 'Voucher đã hết lượt sử dụng' });
    if (order_amount < v.min_order_amount) return res.status(400).json({ success: false, message: `Đơn hàng tối thiểu ${new Intl.NumberFormat('vi-VN').format(v.min_order_amount)}đ` });

    let discount = 0;
        if (v.type === 'percent') discount = Math.round(order_amount * v.value / 100);
    if (v.type === 'freeship') discount = 35000;

    res.json({ success: true, voucher: { id: v.id, code: v.code, type: v.type, value: v.value, discount, description: v.description } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Tăng used_count sau khi đặt hàng thành công
const useVoucher = async (req, res) => {
  const { code } = req.body;
  try {
    await pool.query('UPDATE vouchers SET used_count = used_count + 1 WHERE code = ?', [code.toUpperCase()]);
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
    res.json({ success: true, vouchers: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin: lấy danh sách
const getAllVouchers = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vouchers ORDER BY created_at DESC');
    res.json({ success: true, vouchers: rows });
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