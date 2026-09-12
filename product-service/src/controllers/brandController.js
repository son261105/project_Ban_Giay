const { pool } = require('../config/database');

const getBrands = async (req, res) => {
  try {
    const [brands] = await pool.query('SELECT * FROM brands ORDER BY name');
    res.json({ success: true, brands });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const createBrand = async (req, res) => {
  try {
    const { name, logo_url } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Tên thương hiệu là bắt buộc.' });
    const [result] = await pool.query('INSERT INTO brands (name, logo_url) VALUES (?, ?)', [name, logo_url]);
    res.status(201).json({ success: true, message: 'Thêm thương hiệu thành công!', id: result.insertId });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const updateBrand = async (req, res) => {
  try {
    const { name, logo_url } = req.body;
    await pool.query('UPDATE brands SET name=?, logo_url=? WHERE id=?', [name, logo_url, req.params.id]);
    res.json({ success: true, message: 'Cập nhật thương hiệu thành công!' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const deleteBrand = async (req, res) => {
  try {
    await pool.query('DELETE FROM brands WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Đã xóa thương hiệu.' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

module.exports = { getBrands, createBrand, updateBrand, deleteBrand };
