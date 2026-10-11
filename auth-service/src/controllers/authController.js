const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { pool } = require('../config/database');
const { sendOtpEmail } = require('../utils/mailer');
require('dotenv').config();

const EMAIL_REGEX = /^(?!\.)(?!.*\.\.)[a-z0-9.]{6,30}(?<!\.)@gmail\.com$/;
const PHONE_REGEX = /^0(3|5|7|8|9)[0-9]{8}$/;
const OTP_TTL_MS = 5 * 60 * 1000;        // mã có hiệu lực 5 phút
const RESEND_COOLDOWN_MS = 60 * 1000;    // 60 giây sau mới được gửi lại
const MAX_OTP_ATTEMPTS = 5;              // nhập sai tối đa 5 lần
const otpAttempts = new Map();           // đếm số lần nhập sai theo email
const NAME_REGEX = /^\p{L}+(?: \p{L}+)*$/u;
const MAX_LOGIN_ATTEMPTS = 10;                // sai tối đa 10 lần
const LOGIN_LOCK_MS = 5 * 60 * 1000;         // khóa 5 phút
const loginAttempts = new Map();              // email -> { count, lockedUntil }
const DUMMY_HASH = bcrypt.hashSync('dummy-password-for-timing', 10); // để thời gian phản hồi giống nhau

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
        const { phone, password } = req.body;
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const name = typeof req.body.name === 'string' ? req.body.name.trim().replace(/\s+/g, ' ') : '';
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin.' });
    }
    if (name.length < 2) {
      return res.status(400).json({ success: false, message: 'Họ tên phải có ít nhất 2 ký tự.' });
    }
        if (name.length > 30) {
      return res.status(400).json({ success: false, message: 'Họ tên không được vượt quá 30 ký tự.' });
    }
    if (!NAME_REGEX.test(name)) {
      return res.status(400).json({ success: false, message: 'Họ tên chỉ được chứa chữ cái và khoảng trắng.' });
    }
        if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ success: false, message: 'Email phải là Gmail hợp lệ: tên 6-30 ký tự, chỉ gồm chữ cái, số và dấu chấm (vd: ten@gmail.com).' });
    }
    if (!PHONE_REGEX.test(phone)) {
      return res.status(400).json({ success: false, message: 'Số điện thoại phải gồm 10 số và đúng định dạng Việt Nam.' });
    }
        if (password.length < 8 || password.length > 64) {
      return res.status(400).json({ success: false, message: 'Mật khẩu phải từ 8 đến 64 ký tự.' });
    }
        if (!/[A-Z]/.test(password)) {
      return res.status(400).json({ success: false, message: 'Mật khẩu phải có ít nhất 1 chữ hoa.' });
    }
    if (!/[a-z]/.test(password)) {
      return res.status(400).json({ success: false, message: 'Mật khẩu phải có ít nhất 1 chữ thường.' });
    }
    if (!/[0-9]/.test(password)) {
      return res.status(400).json({ success: false, message: 'Mật khẩu phải có ít nhất 1 chữ số.' });
    }
    if (!/[!-\/:-@\[-`{-~]/.test(password)) {
      return res.status(400).json({ success: false, message: 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt.' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Email này đã được đăng ký.' });
    }

    const [existingPhone] = await pool.query('SELECT id FROM users WHERE phone = ?', [phone]);
    if (existingPhone.length > 0) {
      return res.status(409).json({ success: false, message: 'Số điện thoại này đã được đăng ký.' });
    }
        const [recent] = await pool.query(
      'SELECT expires_at FROM otp_verifications WHERE email = ? ORDER BY created_at DESC LIMIT 1',
      [email]
    );
    if (recent.length > 0) {
      const sentAt = new Date(recent[0].expires_at).getTime() - OTP_TTL_MS;
      const wait = Math.ceil((sentAt + RESEND_COOLDOWN_MS - Date.now()) / 1000);
      if (wait > 0) {
        return res.status(429).json({ success: false, message: `Vui lòng chờ ${wait} giây rồi gửi lại mã.`, retryAfterSeconds: wait });
      }
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
    otpAttempts.delete(email);
    res.json({ success: true, message: 'Đã gửi mã xác thực đến email của bạn.', expiresInSeconds: 300 });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server: ' + err.message });
  }
};

const verifyRegisterOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ success: false, message: 'Vui lòng nhập mã xác thực.' });
    if (!/^[0-9]{6}$/.test(String(otp))) {
      return res.status(400).json({ success: false, message: 'Mã xác thực phải gồm đúng 6 chữ số.' });
    }

    const [rows] = await pool.query(
      'SELECT * FROM otp_verifications WHERE email = ? ORDER BY created_at DESC LIMIT 1',
      [email]
    );
    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Không tìm thấy mã xác thực. Vui lòng gửi lại mã.' });
    }

    const record = rows[0];
    if (new Date(record.expires_at) < new Date()) {
      return res.status(400).json({ success: false, message: 'Mã xác thực đã hết hạn. Vui lòng gửi lại mã.' });
    }

    if (record.otp_code !== String(otp)) {
      const attempts = (otpAttempts.get(email) || 0) + 1;
      if (attempts >= MAX_OTP_ATTEMPTS) {
        otpAttempts.delete(email);
        await pool.query('DELETE FROM otp_verifications WHERE email = ?', [email]);
        return res.status(429).json({ success: false, message: `Bạn đã nhập sai ${MAX_OTP_ATTEMPTS} lần. Mã đã bị hủy, vui lòng gửi lại mã mới.` });
      }
      otpAttempts.set(email, attempts);
      return res.status(400).json({ success: false, message: `Mã xác thực không đúng. Bạn còn ${MAX_OTP_ATTEMPTS - attempts} lần thử.` });
    }
    otpAttempts.delete(email);

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
    const rawEmail = req.body.email;
    const password = req.body.password;
    if (!rawEmail || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập email và mật khẩu.' });
    }
    if (typeof rawEmail !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ.' });
    }
    const email = rawEmail.trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập email và mật khẩu.' });
    }

    // Kiểm tra đang bị khóa do nhập sai nhiều lần
    let entry = loginAttempts.get(email);
    if (entry && entry.lockedUntil && entry.lockedUntil <= Date.now()) {
      loginAttempts.delete(email);
      entry = undefined;
    }
    if (entry && entry.lockedUntil) {
      const minutes = Math.ceil((entry.lockedUntil - Date.now()) / 60000);
            return res.status(429).json({ success: false, message: `Bạn đã nhập sai ${MAX_LOGIN_ATTEMPTS} lần. Vui lòng thử lại sau ${minutes} phút.` });
    }

    const registerFail = () => {
      const count = (entry ? entry.count : 0) + 1;
      if (count >= MAX_LOGIN_ATTEMPTS) {
        loginAttempts.set(email, { count, lockedUntil: Date.now() + LOGIN_LOCK_MS });
        return res.status(429).json({ success: false, message: `Bạn đã nhập sai ${MAX_LOGIN_ATTEMPTS} lần. Vui lòng thử lại sau ${Math.round(LOGIN_LOCK_MS / 60000)} phút.` });
      }
      loginAttempts.set(email, { count, lockedUntil: 0 });
      return res.status(401).json({ success: false, message: `Email hoặc mật khẩu không đúng. Bạn còn ${MAX_LOGIN_ATTEMPTS - count} lần thử.` });
    };

    let user = null;
    if (email.length <= 100) {
      const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
      user = users[0] || null;
    }

    // Luôn chạy 1 lần so sánh bcrypt, kể cả khi email không tồn tại (để thời gian phản hồi giống nhau)
    const match = await bcrypt.compare(password, user ? user.password : DUMMY_HASH);
    if (!user || !match || password.length > 64) return registerFail();

    if (user.status === 'locked') {
      return res.status(403).json({ success: false, message: 'Tài khoản của bạn đã bị khóa.' });
    }

    loginAttempts.delete(email);
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    res.json({
      success: true,
      message: 'Đăng nhập thành công!',
      token,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server: ' + err.message });
  }
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
        if (/[^\x00-\x7F]/.test(newPassword)) {
      return res.status(400).json({ success: false, message: 'Mật khẩu mới không được chứa dấu tiếng Việt hoặc ký tự có dấu.' });
    }
    if (!/[A-Z]/.test(newPassword)) {
      return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có ít nhất 1 chữ hoa.' });
    }
    if (!/[a-z]/.test(newPassword)) {
      return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có ít nhất 1 chữ thường.' });
    }
    if (!/[0-9]/.test(newPassword)) {
      return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có ít nhất 1 chữ số.' });
    }
    if (!/[!-\/:-@\[-`{-~]/.test(newPassword)) {
      return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có ít nhất 1 ký tự đặc biệt.' });
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