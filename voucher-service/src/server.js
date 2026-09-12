const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/vouchers', require('./routes/voucherRoutes'));
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'voucher-service' }));

const PORT = process.env.PORT || 3006;
app.listen(PORT, () => console.log(`Voucher Service running on port ${PORT}`));