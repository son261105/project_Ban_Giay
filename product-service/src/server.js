const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
app.use(cors()); app.use(express.json());
app.use('/api', require('./routes/productRoutes'));
app.get('/health', (_, res) => res.json({ service: 'product-service', status: 'ok' }));
app.listen(process.env.PORT || 5003, () => console.log(`Product Service :${process.env.PORT || 5003}`));
