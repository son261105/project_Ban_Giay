const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { pool } = require('../config/database');
const { sendOtpEmail } = require('../utils/mailer');
require('dotenv').config();

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
const PHONE_REGEX = /^0(3|5|7|8|9)[0-9]{8}$/;

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

const requestRegisterOtp = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin.' });
    }
    if (name.length > 50) {
      return res.status(400).json({ success: false, message: 'Họ tên không được vượt quá 50 ký tự.' });
    }
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ success: false, message: 'Email phải đúng định dạng Gmail (vd: ten@gmail.com).' });
    }
    if (!PHONE_REGEX.test(phone)) {
      return res.status(400).json({ success: false, message: 'Số điện thoại phải gồm 10 số và đúng định dạng Việt Nam.' });
    }
        if (password.length < 8 || password.length > 64) {
      return res.status(400).json({ success: false, message: 'Mật khẩu phải từ 8 đến 64 ký tự.' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Email này đã được đăng ký.' });
    }

    const [existingPhone] = await pool.query('SELECT id FROM users WHERE phone = ?', [phone]);
    if (existingPhone.length > 0) {
      return res.status(409).json({ success: false, message: 'Số điện thoại này đã được đăng ký.' });
    }

    const hash = await bcrypt.hash(password, 10);
    const otpCode = String(crypto.randomInt(100000, 999999));
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await pool.query('DELETE FROM otp_verifications WHERE email = ?', [email]);
    await pool.query(
      'INSERT INTO otp_verifications (name, email, phone, password, otp_code, expires_at) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, phone, hash, otpCode, expiresAt]
    );

    await sendOtpEmail(email, otpCode);

    res.json({ success: true, message: 'Đã gửi mã xác thực đến email của bạn.', expiresInSeconds: 300 });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server: ' + err.message });
  }
};

const verifyRegisterOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ success: false, message: 'Vui lòng nhập mã xác thực.' });

    const [rows] = await pool.query(
      'SELECT * FROM otp_verifications WHERE email = ? AND otp_code = ? ORDER BY created_at DESC LIMIT 1',
      [email, otp]
    );
    if (rows.length === 0) return res.status(400).json({ success: false, message: 'Mã xác thực không đúng.' });

    const record = rows[0];
    if (new Date(record.expires_at) < new Date()) {
      return res.status(400).json({ success: false, message: 'Mã xác thực đã hết hạn. Vui lòng gửi lại mã.' });
    }

    const [existingUser] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      await pool.query('DELETE FROM otp_verifications WHERE email = ?', [email]);
      return res.status(409).json({ success: false, message: 'Email này đã được đăng ký.' });
    }

    const [result] = await pool.query(
      'INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)',
      [record.name, record.email, record.phone, record.password]
    );
    await pool.query('DELETE FROM otp_verifications WHERE email = ?', [email]);

    const token = jwt.sign({ id: result.insertId, email, role: 'user' }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công!',
      token,
      user: { id: result.insertId, name: record.name, email, phone: record.phone, role: 'user' }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server: ' + err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Vui lòng nhập email và mật khẩu.' });
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng.' });
        const user = users[0];
    if (!await bcrypt.compare(password, user.password)) return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng.' });
    if (user.status === 'locked') return res.status(403).json({ success: false, message: 'Tài khoản của bạn đã bị khóa.' });
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    res.json({ success: true, message: 'Đăng nhập thành công!', token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role } });  } catch (err) { res.status(500).json({ success: false, message: 'Lỗi server: ' + err.message }); }
};

const changePhone = async (req, res) => {
  try {
    const { newPhone, currentPassword } = req.body;
    if (!newPhone || !currentPassword) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin.' });
    }
    if (!PHONE_REGEX.test(newPhone)) {
      return res.status(400).json({ success: false, message: 'Số điện thoại phải gồm 10 số và đúng định dạng Việt Nam.' });
    }
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    const user = users[0];
    if (!await bcrypt.compare(currentPassword, user.password)) {
      return res.status(401).json({ success: false, message: 'Mật khẩu hiện tại không đúng.' });
    }
    const [existingPhone] = await pool.query('SELECT id FROM users WHERE phone = ? AND id != ?', [newPhone, req.user.id]);
    if (existingPhone.length > 0) {
      return res.status(409).json({ success: false, message: 'Số điện thoại này đã được sử dụng bởi tài khoản khác.' });
    }
    await pool.query('UPDATE users SET phone = ? WHERE id = ?', [newPhone, req.user.id]);
    res.json({ success: true, message: 'Đổi số điện thoại thành công!', phone: newPhone });
  } catch (err) { res.status(500).json({ success: false, message: 'Lỗi server: ' + err.message }); }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin.' });
    }
    if (newPassword.length < 8 || newPassword.length > 64) {
      return res.status(400).json({ success: false, message: 'Mật khẩu mới phải từ 8 đến 64 ký tự.' });
    }
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    const user = users[0];
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
    }
    if (!await bcrypt.compare(currentPassword, user.password)) {
      return res.status(401).json({ success: false, message: 'Mật khẩu hiện tại không đúng.' });
    }
    const newHash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [newHash, req.user.id]);
    res.json({ success: true, message: 'Đổi mật khẩu thành công!' });
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
    const [users] = await pool.query('SELECT id, name, email, phone, role, status, created_at FROM users ORDER BY created_at DESC');
    res.json({ success: true, users });
  } catch (err) { res.status(500).json({ success: false, message: 'Lỗi server: ' + err.message }); }
};

const deleteUser = async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = ? AND role != "admin"', [req.params.id]);
    res.json({ success: true, message: 'Đã xóa người dùng.' });
  } catch (err) { res.status(500).json({ success: false, message: 'Lỗi server: ' + err.message }); }
};

// Internal - gọi từ profile-service để đồng bộ tên hiển thị cho admin
const syncName = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Thiếu tên.' });
    await pool.query('UPDATE users SET name = ? WHERE id = ?', [name, req.params.userId]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: 'Lỗi server: ' + err.message }); }
};

// Admin khóa / mở khóa tài khoản khách hàng
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    if (Number(id) === req.user.id) {
      return res.status(400).json({ success: false, message: 'Không thể tự khóa tài khoản của chính mình.' });
    }
    const [users] = await pool.query('SELECT status, role FROM users WHERE id = ?', [id]);
    if (users.length === 0) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
    if (users[0].role === 'admin') {
      return res.status(403).json({ success: false, message: 'Không thể khóa tài khoản admin.' });
    }
    const newStatus = users[0].status === 'locked' ? 'active' : 'locked';
    await pool.query('UPDATE users SET status = ? WHERE id = ?', [newStatus, id]);
    res.json({ success: true, message: newStatus === 'locked' ? 'Đã khóa tài khoản.' : 'Đã mở khóa tài khoản.', status: newStatus });
  } catch (err) { res.status(500).json({ success: false, message: 'Lỗi server: ' + err.message }); }
};

module.exports = { register, login, verifyToken, getProfile, getAllUsers, deleteUser, requestRegisterOtp, verifyRegisterOtp, changePhone, changePassword, syncName, toggleUserStatus };