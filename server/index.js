const express = require('express');
const pool = require('./config/db');
require('dotenv').config();

const app = express();
app.use(express.json());

// Test DB connection
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT NOW()');
    res.status(200).json({ status: 'ok' });
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed' });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});

const bcrypt = require('bcrypt');
const saltRounds = 10;

// User Registration
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const result = await pool.query(
      'INSERT INTO Users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
      [name, email, hashedPassword]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const auth = require("./middleware/auth");

app.use(cookieParser());

// Login
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await pool.query("SELECT * FROM Users WHERE email = $1", [email]);
    
    if (user.rows.length === 0 || !await bcrypt.compare(password, user.rows[0].password)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.rows[0].id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, { httpOnly: true });
    res.json({ message: "Logged in successfully" });
    token 
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Add after auth middleware
app.get("/api/protected", auth, (req, res) => {
  res.json({ message: `Hello user ${req.user.id}!` });
});

const { submitQuery } = require("./controllers/queryController");

// Protected query endpoint
app.post("/api/queries", auth, submitQuery);

const { 
  createReport, 
  updateReportStatus,
  getReport 
} = require("./controllers/reportController");

// Protected user endpoints
app.post("/api/reports", auth, createReport);

// Agency endpoint (add agency auth later)
// Change from :id to :reportId for clarity
app.patch("/api/reports/:reportId", auth, updateReportStatus);


app.get("/api/reports/:id", auth, getReport);