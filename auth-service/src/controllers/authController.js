const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
require('dotenv').config();

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin.' });
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(409).json({ success: false, message: 'Email đã được sử dụng.' });
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hash]);
    const token = jwt.sign({ id: result.insertId, email, role: 'user' }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    res.status(201).json({ success: true, message: 'Đăng ký thành công!', token, user: { id: result.insertId, name, email, role: 'user' } });
  } catch (err) { res.status(500).json({ success: false, message: 'Lỗi server: ' + err.message }); }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Vui lòng nhập email và mật khẩu.' });
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng.' });
    const user = users[0];
    if (!await bcrypt.compare(password, user.password)) return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng.' });
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    res.json({ success: true, message: 'Đăng nhập thành công!', token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) { res.status(500).json({ success: false, message: 'Lỗi server: ' + err.message }); }
};

const verifyToken = (req, res) => res.json({ success: true, user: req.user });

const getProfile = async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
    res.json({ success: true, user: users[0] });
  } catch (err) { res.status(500).json({ success: false, message: 'Lỗi server: ' + err.message }); }
};

const getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
    res.json({ success: true, users });
  } catch (err) { res.status(500).json({ success: false, message: 'Lỗi server: ' + err.message }); }
};

const deleteUser = async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = ? AND role != "admin"', [req.params.id]);
    res.json({ success: true, message: 'Đã xóa người dùng.' });
  } catch (err) { res.status(500).json({ success: false, message: 'Lỗi server: ' + err.message }); }
};

module.exports = { register, login, verifyToken, getProfile, getAllUsers, deleteUser };
