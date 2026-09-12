const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
app.use(cors()); app.use(express.json());
app.use('/api/cart', require('./routes/cartRoutes'));
app.get('/health', (_, res) => res.json({ service: 'cart-service', status: 'ok' }));
app.listen(process.env.PORT || 5004, () => console.log(`Cart Service :${process.env.PORT || 5004}`));
