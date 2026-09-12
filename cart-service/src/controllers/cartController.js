const { pool } = require('../config/database');
const axios = require('axios');
require('dotenv').config();

const PRODUCT_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:5003';

const getCart = async (req, res) => {
  try {
    const [items] = await pool.query('SELECT * FROM cart_items WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
    res.json({ success: true, cart: items });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const addToCart = async (req, res) => {
  try {
    const { product_id, quantity = 1, size } = req.body;
    if (!product_id || !size) return res.status(400).json({ success: false, message: 'Vui lòng chọn sản phẩm và size.' });

    // Fetch product info from product-service
    const { data } = await axios.get(`${PRODUCT_URL}/api/products/${product_id}`);
    if (!data.success) return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại.' });
    const product = data.product;

    // Check stock for requested size
    const sizeStock = product.stock_by_size?.find(s => s.size === size);
    if (!sizeStock || sizeStock.quantity < quantity) {
      return res.status(400).json({ success: false, message: `Size ${size} không đủ tồn kho.` });
    }

    const [existing] = await pool.query(
      'SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ? AND size = ?',
      [req.user.id, product_id, size]
    );

    if (existing.length > 0) {
      const newQty = existing[0].quantity + quantity;
      if (newQty > sizeStock.quantity) return res.status(400).json({ success: false, message: `Chỉ còn ${sizeStock.quantity} đôi size ${size}.` });
      await pool.query('UPDATE cart_items SET quantity = ? WHERE id = ?', [newQty, existing[0].id]);
    } else {
      await pool.query(
        'INSERT INTO cart_items (user_id, product_id, product_name, product_price, product_image, brand_name, quantity, size) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [req.user.id, product_id, product.name, product.price, product.image_url, product.brand_name, quantity, size]
      );
    }
    res.json({ success: true, message: 'Đã thêm vào giỏ hàng!' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const updateCart = async (req, res) => {
  try {
    const { quantity } = req.body;
    if (quantity < 1) {
      await pool.query('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
      return res.json({ success: true, message: 'Đã xóa khỏi giỏ hàng.' });
    }
    await pool.query('UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?', [quantity, req.params.id, req.user.id]);
    res.json({ success: true, message: 'Cập nhật giỏ hàng thành công!' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const removeFromCart = async (req, res) => {
  try {
    await pool.query('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ success: true, message: 'Đã xóa khỏi giỏ hàng.' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const clearCart = async (req, res) => {
  try {
    await pool.query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);
    res.json({ success: true, message: 'Đã xóa giỏ hàng.' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Internal: get cart for order processing
const getCartInternal = async (req, res) => {
  try {
    const [items] = await pool.query('SELECT * FROM cart_items WHERE user_id = ?', [req.params.userId]);
    res.json({ success: true, cart: items });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Internal: clear cart after order
const clearCartInternal = async (req, res) => {
  try {
    await pool.query('DELETE FROM cart_items WHERE user_id = ?', [req.params.userId]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

module.exports = { getCart, addToCart, updateCart, removeFromCart, clearCart, getCartInternal, clearCartInternal };
