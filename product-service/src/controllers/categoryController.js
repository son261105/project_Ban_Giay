const { pool } = require('../config/database');

const getCategories = async (req, res) => {
  try {
    const [categories] = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json({ success: true, categories });
  } catch (err) { 
    res.status(500).json({ success: false, message: err.message }); 
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, slug, description } = req.body;
    if (!name || !slug) return res.status(400).json({ success: false, message: 'Tên và slug là bắt buộc.' });
    
    const [result] = await pool.query('INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)', [name, slug, description]);
    res.status(201).json({ success: true, message: 'Thêm danh mục thành công!', id: result.insertId });
  } catch (err) { 
    res.status(500).json({ success: false, message: err.message }); 
  }
};

const updateCategory = async (req, res) => {
  try {
    const { name, slug, description } = req.body;
    if (!name || !slug) return res.status(400).json({ success: false, message: 'Tên và slug là bắt buộc.' });
    
    await pool.query('UPDATE categories SET name = ?, slug = ?, description = ? WHERE id = ?', [name, slug, description, req.params.id]);
    res.json({ success: true, message: 'Cập nhật danh mục thành công!' });
  } catch (err) { 
    res.status(500).json({ success: false, message: err.message }); 
  }
};

const deleteCategory = async (req, res) => {
  try {
    await pool.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Đã xóa danh mục!' });
  } catch (err) { 
    res.status(500).json({ success: false, message: err.message }); 
  }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
