const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
app.use(cors()); app.use(express.json());
app.use('/api/orders', require('./routes/orderRoutes'));
app.get('/health', (_, res) => res.json({ service: 'order-service', status: 'ok' }));
app.listen(process.env.PORT || 5005, () => console.log(`Order Service :${process.env.PORT || 5005}`));
