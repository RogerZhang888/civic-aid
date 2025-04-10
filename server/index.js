const express = require('express');
const pool = require('./config/db');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();
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
const reportController = require('./controllers/reportController');
const auth = require('./middleware/auth');
const mediaRoutes = require('./routes/mediaRoutes');

app.use('/api', authRoutes);
app.use('/api', queryRoutes);
app.use('/api', mediaRoutes);

// Direct report endpoints
app.post('/api/reports', auth, reportController.createReport);
app.patch('/api/reports/:id', auth, reportController.updateReportStatus);
app.get('/api/reports/:id', auth, reportController.getReport);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
