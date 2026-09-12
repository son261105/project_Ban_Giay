const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { authenticate, isAdmin } = require('./middleware/auth');
require('dotenv').config();

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(morgan('dev'));

const {
  AUTH_SERVICE_URL,
  PROFILE_SERVICE_URL,
  PRODUCT_SERVICE_URL,
  CART_SERVICE_URL,
  ORDER_SERVICE_URL,
} = process.env;

const proxy = (target) => createProxyMiddleware({
  target,
  changeOrigin: true,
  on: {
    error: (err, req, res) => res.status(502).json({ success: false, message: 'Service không khả dụng: ' + err.message })
  }
});

// ── Health check
app.get('/health', (_, res) => {
  res.json({
    service: 'api-gateway',
    status: 'ok',
    services: {
      auth: AUTH_SERVICE_URL,
      profile: PROFILE_SERVICE_URL,
      product: PRODUCT_SERVICE_URL,
      cart: CART_SERVICE_URL,
      order: ORDER_SERVICE_URL,
    }
  });
});

// ── Auth routes (public)
app.use('/api/auth', proxy(AUTH_SERVICE_URL));

// ── Profile routes (protected)
app.use('/api/profile', authenticate, proxy(PROFILE_SERVICE_URL));

// ── Product routes
app.get('/api/products', proxy(PRODUCT_SERVICE_URL));
app.get('/api/products/:id', proxy(PRODUCT_SERVICE_URL));
app.get('/api/brands', proxy(PRODUCT_SERVICE_URL));
app.get('/api/categories', proxy(PRODUCT_SERVICE_URL));

app.post('/api/products', authenticate, isAdmin, proxy(PRODUCT_SERVICE_URL));
app.put('/api/products/:id', authenticate, isAdmin, proxy(PRODUCT_SERVICE_URL));
app.delete('/api/products/:id', authenticate, isAdmin, proxy(PRODUCT_SERVICE_URL));
app.post('/api/brands', authenticate, isAdmin, proxy(PRODUCT_SERVICE_URL));
app.put('/api/brands/:id', authenticate, isAdmin, proxy(PRODUCT_SERVICE_URL));
app.delete('/api/brands/:id', authenticate, isAdmin, proxy(PRODUCT_SERVICE_URL));
app.post('/api/categories', authenticate, isAdmin, proxy(PRODUCT_SERVICE_URL));
app.put('/api/categories/:id', authenticate, isAdmin, proxy(PRODUCT_SERVICE_URL));
app.delete('/api/categories/:id', authenticate, isAdmin, proxy(PRODUCT_SERVICE_URL));

// Inventory (admin)
app.use('/api/inventory', authenticate, isAdmin, proxy(PRODUCT_SERVICE_URL));

// ── Cart routes (protected)
app.use('/api/cart', authenticate, proxy(CART_SERVICE_URL));

// ── Order routes (protected)
app.use('/api/orders', authenticate, proxy(ORDER_SERVICE_URL));

// ── Admin stats
app.use('/api/admin', authenticate, isAdmin, proxy(ORDER_SERVICE_URL));

// ── Voucher routes
const VOUCHER_SERVICE_URL = process.env.VOUCHER_SERVICE_URL || 'http://localhost:3006';

app.get('/api/vouchers/public', proxy(VOUCHER_SERVICE_URL));
app.post('/api/vouchers/validate', authenticate, proxy(VOUCHER_SERVICE_URL));
app.post('/api/vouchers/use', authenticate, proxy(VOUCHER_SERVICE_URL));
app.get('/api/vouchers/admin', authenticate, isAdmin, proxy(VOUCHER_SERVICE_URL));
app.post('/api/vouchers/admin', authenticate, isAdmin, proxy(VOUCHER_SERVICE_URL));
app.put('/api/vouchers/admin/:id', authenticate, isAdmin, proxy(VOUCHER_SERVICE_URL));
app.patch('/api/vouchers/admin/:id/toggle', authenticate, isAdmin, proxy(VOUCHER_SERVICE_URL));
app.delete('/api/vouchers/admin/:id', authenticate, isAdmin, proxy(VOUCHER_SERVICE_URL));

// 404
app.use((req, res) => res.status(404).json({ success: false, message: 'Route không tồn tại.' }));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`\n🚀 API Gateway running on http://localhost:${PORT}`);
  console.log(`   Auth    → ${AUTH_SERVICE_URL}`);
  console.log(`   Profile → ${PROFILE_SERVICE_URL}`);
  console.log(`   Product → ${PRODUCT_SERVICE_URL}`);
  console.log(`   Cart    → ${CART_SERVICE_URL}`);
  console.log(`   Order   → ${ORDER_SERVICE_URL}\n`);
});