const express = require('express');
const app = express();
const pool = require('./config/db');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Health check
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT NOW()');
    res.status(200).json({ status: 'ok' });
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Mount routers
const queryRoutes = require('./routes/queryRoutes');
const authRoutes = require('./routes/authRoutes');
const reportRoutes = require('./routes/reportRoutes');

app.use('/api', authRoutes);
app.use('/api', queryRoutes);
app.use('/api', reportRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
