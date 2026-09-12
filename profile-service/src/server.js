const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
app.use(cors()); app.use(express.json());
app.use('/api/profile', require('./routes/profileRoutes'));
app.get('/health', (_, res) => res.json({ service: 'profile-service', status: 'ok' }));
app.listen(process.env.PORT || 5002, () => console.log(`Profile Service :${process.env.PORT || 5002}`));
