const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const auth = require('../middleware/auth');
const saltRounds = 10;

// Register
router.post('/register', async (req, res) => {
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

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await pool.query("SELECT * FROM Users WHERE email = $1", [email]);
    if (user.rows.length === 0 || !await bcrypt.compare(password, user.rows[0].password)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.cookie("token", token, { httpOnly: true });
    res.json({ message: "Logged in successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Protected route example
router.get('/protected', auth, (req, res) => {
  res.json({ message: `Hello user ${req.user.id}!` });
});

module.exports = router;
