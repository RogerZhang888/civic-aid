const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware");
const { NeonDbError } = require("@neondatabase/serverless");
const pgsql = require("../config/db");

const router = express.Router();
const saltRounds = 10;

/**
 * @route   POST /register
 * @desc    Registers a new user with name, email, and hashed password.
 * @access  Public
 * @body    { name: string, email: string, password: string }
 * @returns 201 on success, 500 with error message on failure
 */
router.post("/register", async (req, res) => {
   
   console.log("RUNNING REGISTRATION HANDLER");

   try {

      const { name, email, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      await pgsql.query(
         "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
         [name, email, hashedPassword]
      );

      console.log(`User ${name} (${email}) was registered successfully`);

      // don't return any user data
      res.status(201).json({ success: true });

   } catch (error) {

      if (error instanceof NeonDbError) {
         // likely due to duplicate key
         // meaning user already registered, email already in 'users' table
         console.log(error);
         res.status(500).json({ error: error.detail });
      } else {
         console.log(error);
         res.status(500).json({ error: error.message });
      }

   }
});

/**
 * @route   POST /login
 * @desc    Authenticates a user and issues a JWT token stored in an HTTP-only cookie.
 * @access  Public
 * @body    { email: string, password: string }
 * @returns 200 with user data on success, 401 or 500 with error on failure
 */
router.post("/login", async (req, res) => {

   console.log("RUNNING LOGIN HANDLER");

   try {

      const { userName: reqUserName, password } = req.body;
      const pgsqlLoginRes = await pgsql.query("SELECT * FROM users WHERE name = $1", [reqUserName]);

      if (pgsqlLoginRes.length === 0 || !(await bcrypt.compare(password, pgsqlLoginRes[0].password))) {
         console.log("invalid credentials");
         return res.status(401).json({ error: "invalid credentials" });
      }

      const { id, name: resUserName, email: resEmail } = pgsqlLoginRes[0];

      const token = jwt.sign(
         { 
            id,
            userName: resUserName,
            email: resEmail
         },
         process.env.JWT_SECRET,
         { expiresIn: 60 * 60 }
      );

      console.log(`User ${resUserName} logged in successfully`);

      res.cookie("token", token, { 
         httpOnly: true,
         secure: process.env.NODE_ENV === "production",
         sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
      });
      res.json({ id, userName: resUserName, email: resEmail });

   } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
   }
});

/**
 * @route   POST /logout
 * @desc    Logs out the user by clearing the JWT cookie.
 * @access  Private (requires valid token)
 * @returns 200 with success message
 */
router.post('/logout', authMiddleware, (req, res) => {

   const { email } = req.user;

   console.log("RUNNING LOGOUT HANDLER");

   res.clearCookie("token", {
     httpOnly: true,
     secure: process.env.NODE_ENV === 'production',
     sameSite: 'strict',
   });

   console.log(`User ${email} logged out successfully`);
 
   res.json({ success: true });
});

/**
 * @route   GET /protected
 * @desc    Example of a protected route. Returns authenticated user's data.
 * @access  Private
 * @returns 200 with user data if authenticated
 */
router.get("/protected", authMiddleware, (req, res) => {
   const { email } = req.user;
   console.log(`User ${email} accessed protected route`);
   res.json(req.user);
});

module.exports = router;
