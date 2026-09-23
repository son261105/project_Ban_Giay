const { pool } = require('../config/database');
const axios = require('axios');
require('dotenv').config();

const CART_URL = process.env.CART_SERVICE_URL || 'http://localhost:5004';
const PRODUCT_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:5003';
const VOUCHER_URL = process.env.VOUCHER_SERVICE_URL || 'http://localhost:3006';

const createOrder = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { shipping_address, phone, note, voucher_code, voucher_codes } = req.body;
    if (!shipping_address) return res.status(400).json({ success: false, message: 'Vui lòng nhập địa chỉ giao hàng.' });

    const cartRes = await axios.get(`${CART_URL}/api/cart/internal/${req.user.id}`);
    const cartItems = cartRes.data.cart;
    if (!cartItems || cartItems.length === 0) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Giỏ hàng trống.' });
    }

    const subtotalAmount = cartItems.reduce((sum, item) => sum + parseFloat(item.product_price) * item.quantity, 0);

    const codeList = Array.isArray(voucher_codes) ? voucher_codes.filter(Boolean) : (voucher_code ? [voucher_code] : []);

    let discountAmount = 0;
    let appliedVoucherCodes = [];
    if (codeList.length > 0) {
      try {
        const voucherRes = await axios.post(`${VOUCHER_URL}/api/vouchers/validate`, {
          codes: codeList,
          order_amount: subtotalAmount
        });
        const { vouchers = [], invalid = [] } = voucherRes.data;
        if (vouchers.length === 0) {
          await conn.rollback();
          return res.status(400).json({ success: false, message: invalid[0]?.message || 'Mã voucher không hợp lệ' });
        }
        discountAmount = voucherRes.data.totalDiscount || 0;
        appliedVoucherCodes = vouchers.map(v => v.code);
      } catch (voucherErr) {
        await conn.rollback();
        const msg = voucherErr.response?.data?.message || 'Mã voucher không hợp lệ';
        return res.status(400).json({ success: false, message: msg });
      }
    }
    const appliedVoucherCode = appliedVoucherCodes.length > 0 ? appliedVoucherCodes.join(',') : null;

    const SHIPPING_FEE = 35000;
    const totalAmount = Math.max(0, subtotalAmount + SHIPPING_FEE - discountAmount);

        const [orderResult] = await conn.query(
      'INSERT INTO orders (user_id, user_name, user_email, subtotal_amount, discount_amount, voucher_code, total_amount, shipping_address, phone, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, req.user.name || '', req.user.email, subtotalAmount, discountAmount, appliedVoucherCode, totalAmount, shipping_address, phone, note]
    );
    const orderId = orderResult.insertId;
    await conn.query('INSERT INTO order_status_history (order_id, status) VALUES (?, ?)', [orderId, 'pending']);

        for (const item of cartItems) {
            await conn.query(
        'INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, size, price) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [orderId, item.product_id, item.product_name, item.product_image, item.quantity, item.size, item.product_price]
      );
    }

    await axios.post(`${PRODUCT_URL}/api/products/decrease-stock`, {
      items: cartItems.map(i => ({ product_id: i.product_id, size: i.size, quantity: i.quantity }))    });

    await axios.delete(`${CART_URL}/api/cart/internal/${req.user.id}/clear`);

        if (appliedVoucherCodes.length > 0) {
      await axios.post(`${VOUCHER_URL}/api/vouchers/use`, { codes: appliedVoucherCodes }).catch(() => {});
    }

    await conn.commit();
    res.status(201).json({ success: true, message: 'Đặt hàng thành công!', orderId });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ success: false, message: err.message });
  } finally { conn.release(); }
};

const getUserOrders = async (req, res) => {
  try {
    const [orders] = await pool.query('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
    for (const order of orders) {
      const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
      order.items = items;
    }
    res.json({ success: true, orders });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Khách hàng xem chi tiết 1 đơn hàng của chính mình (kèm timeline trạng thái)
const getMyOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng.' });
    const order = rows[0];
    const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [id]);
    const [history] = await pool.query('SELECT status, changed_at FROM order_status_history WHERE order_id = ? ORDER BY changed_at ASC', [id]);
    order.items = items;
    order.history = history;
    res.json({ success: true, order });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const getAllOrders = async (req, res) => {
  try {
    const [orders] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    for (const order of orders) {
      const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
      order.items = items;
    }
    res.json({ success: true, orders });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Khách hàng tự hủy đơn (chỉ khi đơn còn ở trạng thái "Chờ xác nhận")
const cancelMyOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });

    const order = rows[0];
    if (order.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Đơn hàng đã được xử lý, không thể hủy' });
    }

        await pool.query('UPDATE orders SET status = ? WHERE id = ?', ['cancelled', id]);
    await pool.query('INSERT INTO order_status_history (order_id, status) VALUES (?, ?)', [id, 'cancelled']);
    res.json({ success: true, message: 'Hủy đơn hàng thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ.' });
    await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    await pool.query('INSERT INTO order_status_history (order_id, status) VALUES (?, ?)', [req.params.id, status]);
    res.json({ success: true, message: 'Cập nhật trạng thái đơn hàng thành công!' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Admin - thống kê đơn hàng của 1 người dùng cụ thể (dùng cho modal "Chi tiết người dùng")
const getUserOrderSummary = async (req, res) => {
  try {
    const { userId } = req.params;
    const [[{ totalOrders }]] = await pool.query('SELECT COUNT(*) as totalOrders FROM orders WHERE user_id = ?', [userId]);
    const [[{ totalSpent }]] = await pool.query(
      "SELECT COALESCE(SUM(total_amount),0) as totalSpent FROM orders WHERE user_id = ? AND status != 'cancelled'",
      [userId]
    );
    const [recentOrders] = await pool.query(
      'SELECT id, total_amount, status, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 5',
      [userId]
    );
    res.json({ success: true, totalOrders, totalSpent, recentOrders });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const getDashboardStats = async (req, res) => {
  try {
    const [[{ totalOrders }]] = await pool.query('SELECT COUNT(*) as totalOrders FROM orders');
    const [[{ totalRevenue }]] = await pool.query("SELECT COALESCE(SUM(total_amount),0) as totalRevenue FROM orders WHERE status != 'cancelled'");
    const [[{ pendingOrders }]] = await pool.query("SELECT COUNT(*) as pendingOrders FROM orders WHERE status = 'pending'");
    const [recentOrders] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 5');
    res.json({ success: true, stats: { totalOrders, totalRevenue, pendingOrders }, recentOrders });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Báo cáo doanh thu theo ngày
const getRevenueByDay = async (req, res) => {
  try {
    const { date } = req.query; // YYYY-MM-DD
    if (!date) return res.status(400).json({ success: false, message: 'Vui lòng truyền tham số date (YYYY-MM-DD)' });
    const [[{ revenue }]] = await pool.query(
      "SELECT COALESCE(SUM(total_amount),0) as revenue FROM orders WHERE DATE(created_at) = ? AND status != 'cancelled'",
      [date]
    );
    const [[{ totalOrders }]] = await pool.query(
      "SELECT COUNT(*) as totalOrders FROM orders WHERE DATE(created_at) = ? AND status != 'cancelled'",
      [date]
    );
    res.json({ success: true, date, revenue, totalOrders });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Báo cáo doanh thu theo tháng
const getRevenueByMonth = async (req, res) => {
  try {
    const { month, year } = req.query; // month: 1-12, year: 2024
    if (!month || !year) return res.status(400).json({ success: false, message: 'Vui lòng truyền month và year' });
    const [[{ revenue }]] = await pool.query(
      "SELECT COALESCE(SUM(total_amount),0) as revenue FROM orders WHERE MONTH(created_at) = ? AND YEAR(created_at) = ? AND status != 'cancelled'",
      [month, year]
    );
    const [[{ totalOrders }]] = await pool.query(
      "SELECT COUNT(*) as totalOrders FROM orders WHERE MONTH(created_at) = ? AND YEAR(created_at) = ? AND status != 'cancelled'",
      [month, year]
    );
    res.json({ success: true, month, year, revenue, totalOrders });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Báo cáo doanh thu theo từng ngày trong N ngày gần nhất (cho biểu đồ cột)
const getRevenueByDayRange = async (req, res) => {
  try {
    const days = parseInt(req.query.days, 10) === 30 ? 30 : 7; // chỉ chấp nhận 7 hoặc 30
    const [rows] = await pool.query(
      `SELECT DATE(created_at) as date,
              COALESCE(SUM(total_amount), 0) as revenue,
              COUNT(*) as totalOrders
       FROM orders
       WHERE status != 'cancelled'
         AND created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY DATE(created_at)`,
      [days - 1]
    );

    // Gộp dữ liệu DB vào map để điền đủ tất cả các ngày (ngày không có đơn vẫn hiện cột = 0)
    const map = new Map(rows.map(r => [
      new Date(r.date).toISOString().split('T')[0],
      { revenue: Number(r.revenue), totalOrders: Number(r.totalOrders) }
    ]));

    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const entry = map.get(key) || { revenue: 0, totalOrders: 0 };
      result.push({ date: key, revenue: entry.revenue, totalOrders: entry.totalOrders });
    }

    res.json({ success: true, days, data: result });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Báo cáo doanh thu theo từng tháng trong 1 năm (cho biểu đồ cột)
const getRevenueByMonthRange = async (req, res) => {
  try {
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();
    const [rows] = await pool.query(
      `SELECT MONTH(created_at) as month,
              COALESCE(SUM(total_amount), 0) as revenue,
              COUNT(*) as totalOrders
       FROM orders
       WHERE status != 'cancelled' AND YEAR(created_at) = ?
       GROUP BY MONTH(created_at)`,
      [year]
    );

    const map = new Map(rows.map(r => [Number(r.month), { revenue: Number(r.revenue), totalOrders: Number(r.totalOrders) }]));

    const result = [];
    for (let m = 1; m <= 12; m++) {
      const entry = map.get(m) || { revenue: 0, totalOrders: 0 };
      result.push({ month: m, revenue: entry.revenue, totalOrders: entry.totalOrders });
    }

    res.json({ success: true, year, data: result });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Top 5 sản phẩm bán chạy
const getTopProducts = async (req, res) => {
  try {
    const [topProducts] = await pool.query(
      `SELECT oi.product_id, oi.product_name, oi.product_image,
        SUM(oi.quantity) as total_quantity,
        SUM(oi.quantity * oi.price) as total_revenue
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE o.status != 'cancelled'
       GROUP BY oi.product_id, oi.product_name, oi.product_image
       ORDER BY total_quantity DESC
       LIMIT 5`
    );
    res.json({ success: true, topProducts });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

module.exports = { createOrder, getUserOrders, getAllOrders, updateOrderStatus, cancelMyOrder, getDashboardStats, getRevenueByDay, getRevenueByMonth, getRevenueByDayRange, getRevenueByMonthRange, getTopProducts, getUserOrderSummary, getMyOrderById };