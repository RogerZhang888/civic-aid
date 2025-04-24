const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

app.use(cors({
   origin: `http://localhost:5173`, // Explicitly allow your frontend origin
   credentials: true, // Allow credentials
   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Allowed methods
   allowedHeaders: ['Content-Type', 'Authorization'] // Allowed headers
}));
app.use(express.json());
app.use(cookieParser());

// Health check
app.get('/health', async (req, res) => {
  try {
    res.status(200).json({ status: 'ok' });
  } catch (error) {
    res.status(500).json({ error: 'Backend connection failed' });
  }
});

// Mount routers
const queryRoutes = require('./routes/queryRoutes');
const authRoutes = require('./routes/authRoutes');
const reportRoutes = require('./routes/reportRoutes');
const chatRoutes = require('./routes/chatRoutes');

app.use('/api', authRoutes);
app.use('/api', queryRoutes);
app.use('/api', reportRoutes);
app.use('/api', chatRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
