const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
app.use(cors()); app.use(express.json());
app.use('/api/auth', require('./routes/authRoutes'));
app.get('/health', (_, res) => res.json({ service: 'auth-service', status: 'ok' }));
app.listen(process.env.PORT || 5001, () => console.log(`Auth Service :${process.env.PORT || 5001}`));
