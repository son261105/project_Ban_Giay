const { pool } = require('../config/database');

const getProfile = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM profiles WHERE user_id = ?', [req.user.id]);
    if (rows.length === 0) {
      // Auto-create profile if not exists
      await pool.query('INSERT INTO profiles (user_id, name) VALUES (?, ?)', [req.user.id, req.user.email]);
      const [newRows] = await pool.query('SELECT * FROM profiles WHERE user_id = ?', [req.user.id]);
      return res.json({ success: true, profile: newRows[0] });
    }
    res.json({ success: true, profile: rows[0] });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, avatar_url } = req.body;
    const [existing] = await pool.query('SELECT id FROM profiles WHERE user_id = ?', [req.user.id]);
    if (existing.length === 0) {
      await pool.query('INSERT INTO profiles (user_id, name, phone, address, avatar_url) VALUES (?, ?, ?, ?, ?)',
        [req.user.id, name, phone, address, avatar_url]);
    } else {
      await pool.query('UPDATE profiles SET name=?, phone=?, address=?, avatar_url=? WHERE user_id=?',
        [name, phone, address, avatar_url, req.user.id]);
    }
    res.json({ success: true, message: 'Cập nhật hồ sơ thành công!' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Called internally to get name for navbar
const getNameByUserId = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT name FROM profiles WHERE user_id = ?', [req.params.userId]);
    res.json({ success: true, name: rows[0]?.name || '' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

module.exports = { getProfile, updateProfile, getNameByUserId };
