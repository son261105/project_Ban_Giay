const jwt = require('jsonwebtoken');
require('dotenv').config();
const authenticate = (req, res, next) => {
  const h = req.headers.authorization;
  if (!h || !h.startsWith('Bearer '))
    return res.status(401).json({ success: false, message: 'Không có token xác thực.' });
  try { req.user = jwt.verify(h.split(' ')[1], process.env.JWT_SECRET); next(); }
  catch { return res.status(401).json({ success: false, message: 'Token không hợp lệ.' }); }
};
const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin')
    return res.status(403).json({ success: false, message: 'Không có quyền truy cập.' });
  next();
};
module.exports = { authenticate, isAdmin };
