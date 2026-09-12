const { pool } = require('../config/database');

// Get all suppliers
const getSuppliers = async (req, res) => {
  try {
    const [suppliers] = await pool.query('SELECT * FROM suppliers ORDER BY created_at DESC');
    res.json({ success: true, suppliers });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const createSupplier = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Tên nhà cung cấp là bắt buộc.' });
    const [r] = await pool.query('INSERT INTO suppliers (name, email, phone, address) VALUES (?, ?, ?, ?)', [name, email, phone, address]);
    res.status(201).json({ success: true, message: 'Thêm nhà cung cấp thành công!', id: r.insertId });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Get import receipts
const getImportReceipts = async (req, res) => {
  try {
    const [receipts] = await pool.query(
      `SELECT ir.*, s.name as supplier_name FROM import_receipts ir
       LEFT JOIN suppliers s ON ir.supplier_id = s.id ORDER BY ir.created_at DESC`
    );
    for (const r of receipts) {
      const [items] = await pool.query(
        `SELECT iri.*, p.name as product_name FROM import_receipt_items iri
         JOIN products p ON iri.product_id = p.id WHERE iri.receipt_id = ?`, [r.id]
      );
      r.items = items;
    }
    res.json({ success: true, receipts });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const createImportReceipt = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { supplier_id, note, items } = req.body;
    // items: [{ product_id, size, quantity, cost_price }]
    if (!items || items.length === 0) return res.status(400).json({ success: false, message: 'Phiếu nhập cần ít nhất 1 sản phẩm.' });
    const total_cost = items.reduce((s, i) => s + i.quantity * i.cost_price, 0);
    const [r] = await conn.query('INSERT INTO import_receipts (supplier_id, note, total_cost, created_by) VALUES (?, ?, ?, ?)',
      [supplier_id, note, total_cost, req.user.id]);
    for (const item of items) {
      await conn.query('INSERT INTO import_receipt_items (receipt_id, product_id, size, quantity, cost_price) VALUES (?, ?, ?, ?, ?)',
        [r.insertId, item.product_id, item.size, item.quantity, item.cost_price]);
      await conn.query('INSERT INTO product_stock (product_id, size, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + ?',
        [item.product_id, item.size, item.quantity, item.quantity]);
    }
    await conn.commit();
    res.status(201).json({ success: true, message: 'Tạo phiếu nhập thành công!', id: r.insertId });
  } catch (err) { await conn.rollback(); res.status(500).json({ success: false, message: err.message }); }
  finally { conn.release(); }
};

// Get low stock alert (quantity < threshold)
const getLowStock = async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 5;
    const [rows] = await pool.query(
      `SELECT ps.*, p.name as product_name, p.image_url, b.name as brand_name
       FROM product_stock ps
       JOIN products p ON ps.product_id = p.id
       LEFT JOIN brands b ON p.brand_id = b.id
       WHERE ps.quantity <= ? ORDER BY ps.quantity ASC`, [threshold]
    );
    res.json({ success: true, items: rows, threshold });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Get stock overview per product
const getStockOverview = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.id, p.name, p.image_url, b.name as brand_name,
       COALESCE(SUM(ps.quantity), 0) as total_stock,
       JSON_ARRAYAGG(JSON_OBJECT('size', ps.size, 'quantity', ps.quantity)) as stock_by_size
       FROM products p
       LEFT JOIN brands b ON p.brand_id = b.id
       LEFT JOIN product_stock ps ON p.id = ps.product_id
       GROUP BY p.id ORDER BY total_stock ASC`
    );
    res.json({ success: true, overview: rows });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

module.exports = { getSuppliers, createSupplier, getImportReceipts, createImportReceipt, getLowStock, getStockOverview };
