const { pool } = require('../config/database');

// Helper: get total stock of a product (sum all sizes)
const getTotalStock = async (productId) => {
  const [rows] = await pool.query('SELECT COALESCE(SUM(quantity),0) as total FROM product_stock WHERE product_id = ?', [productId]);
  return parseInt(rows[0].total);
};

const DEFAULT_QTY = 100; // số lượng mặc định khi admin tick 1 size mới

// Upload nhiều ảnh từ máy tính, trả về danh sách URL
const uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ success: false, message: 'Chưa chọn ảnh nào.' });
    const base = process.env.PUBLIC_URL_BASE || `http://localhost:${process.env.PORT || 5003}`;
    res.json({ success: true, urls: req.files.map(f => `${base}/uploads/${f.filename}`) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Get all products with search, filter, pagination
const getProducts = async (req, res) => {
  try {
    const { search, brand_id, category_id, category, min_price, max_price, page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;
    let where = [], params = [];

    if (search) { where.push('(p.name LIKE ? OR p.description LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }
    if (brand_id) { where.push('p.brand_id = ?'); params.push(brand_id); }
    if (category_id) { where.push('p.category_id = ?'); params.push(category_id); }
    if (category) { where.push('c.slug = ?'); params.push(category); }
    if (min_price) { where.push('p.price >= ?'); params.push(min_price); }
    if (max_price) { where.push('p.price <= ?'); params.push(max_price); }

    const w = where.length ? 'WHERE ' + where.join(' AND ') : '';
    const [products] = await pool.query(
      `SELECT p.*, b.name as brand_name, c.name as category_name, c.slug as category_slug,
       COALESCE((SELECT SUM(quantity) FROM product_stock WHERE product_id = p.id), 0) as stock
       FROM products p
       LEFT JOIN brands b ON p.brand_id = b.id
       LEFT JOIN categories c ON p.category_id = c.id
       ${w} ORDER BY p.created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) as total FROM products p LEFT JOIN brands b ON p.brand_id = b.id LEFT JOIN categories c ON p.category_id = c.id ${w}`, params);
    const productsClean = products.map(p => ({ ...p, price: parseFloat(p.price) }));
    res.json({ success: true, products: productsClean, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Get single product with stock per size
const getProduct = async (req, res) => {
  try {
    const [products] = await pool.query(
      `SELECT p.*, b.name as brand_name, c.name as category_name, c.slug as category_slug,
       COALESCE((SELECT SUM(quantity) FROM product_stock WHERE product_id = p.id), 0) as stock
       FROM products p
       LEFT JOIN brands b ON p.brand_id = b.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`, [req.params.id]
    );
    if (products.length === 0) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm.' });
        const [stockRows] = await pool.query('SELECT size, quantity FROM product_stock WHERE product_id = ? ORDER BY CAST(size AS UNSIGNED)', [req.params.id]);
    const [imgRows] = await pool.query('SELECT image_url FROM product_images WHERE product_id = ? ORDER BY sort_order, id', [req.params.id]);
    let images = imgRows.map(i => i.image_url);
    if (images.length === 0 && products[0].image_url) images = [products[0].image_url];
    res.json({ success: true, product: { ...products[0], price: parseFloat(products[0].price), stock_by_size: stockRows, images } });  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Create product
const createProduct = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
        const { name, description, description_detail, price, brand_id, category_id, images = [], sizes = [] } = req.body;
    if (!name || !price) return res.status(400).json({ success: false, message: 'Tên và giá là bắt buộc.' });
    const imgList = (images || []).slice(0, 10);
    const [result] = await conn.query(
      'INSERT INTO products (name, description, description_detail, price, brand_id, category_id, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, description, description_detail || null, price, brand_id || null, category_id || null, imgList[0] || null]
    );
    const productId = result.insertId;
    for (let i = 0; i < imgList.length; i++) {
      await conn.query('INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?, ?, ?)', [productId, imgList[i], i]);
    }
    for (const size of sizes) {
      await conn.query('INSERT INTO product_stock (product_id, size, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity', [productId, String(size), DEFAULT_QTY]);
    }
    await conn.commit();
    res.status(201).json({ success: true, message: 'Thêm sản phẩm thành công!', id: productId });
  } catch (err) { await conn.rollback(); res.status(500).json({ success: false, message: err.message }); }
  finally { conn.release(); }
};

// Update product
const updateProduct = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
        const { name, description, description_detail, price, brand_id, category_id, images = [], sizes = [] } = req.body;
    const [existing] = await conn.query('SELECT id FROM products WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm.' });
    const imgList = (images || []).slice(0, 10);
    await conn.query('UPDATE products SET name=?, description=?, description_detail=?, price=?, brand_id=?, category_id=?, image_url=? WHERE id=?',
      [name, description, description_detail || null, price, brand_id || null, category_id || null, imgList[0] || null, req.params.id]);

    await conn.query('DELETE FROM product_images WHERE product_id = ?', [req.params.id]);
    for (let i = 0; i < imgList.length; i++) {
      await conn.query('INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?, ?, ?)', [req.params.id, imgList[i], i]);
    }

    const [oldStock] = await conn.query('SELECT size, quantity FROM product_stock WHERE product_id = ?', [req.params.id]);
    const oldMap = {};
    oldStock.forEach(r => { oldMap[r.size] = r.quantity; });
    await conn.query('DELETE FROM product_stock WHERE product_id = ?', [req.params.id]);
    for (const size of sizes) {
      const s = String(size);
      await conn.query('INSERT INTO product_stock (product_id, size, quantity) VALUES (?, ?, ?)', [req.params.id, s, oldMap[s] !== undefined ? oldMap[s] : DEFAULT_QTY]);
    }
    await conn.commit();
    res.json({ success: true, message: 'Cập nhật sản phẩm thành công!' });
  } catch (err) { await conn.rollback(); res.status(500).json({ success: false, message: err.message }); }
  finally { conn.release(); }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT id FROM products WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm.' });
    await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Xóa sản phẩm thành công!' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Decrease stock when order placed (called internally)
const decreaseStock = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { items } = req.body; // [{ product_id, size, quantity }]
    for (const item of items) {
      const [rows] = await conn.query('SELECT quantity FROM product_stock WHERE product_id = ? AND size = ?', [item.product_id, item.size]);
      if (rows.length === 0 || rows[0].quantity < item.quantity) {
        await conn.rollback();
        return res.status(400).json({ success: false, message: `Không đủ tồn kho: sản phẩm #${item.product_id} size ${item.size}` });
      }
      await conn.query('UPDATE product_stock SET quantity = quantity - ? WHERE product_id = ? AND size = ?', [item.quantity, item.product_id, item.size]);
    }
    await conn.commit();
    res.json({ success: true, message: 'Đã cập nhật tồn kho.' });
  } catch (err) { await conn.rollback(); res.status(500).json({ success: false, message: err.message }); }
  finally { conn.release(); }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct, decreaseStock, uploadImages };