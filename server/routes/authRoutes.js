import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import authMiddleware from '../middleware/authMiddleware.js';
import { NeonDbError } from '@neondatabase/serverless';
import pgsql from '../config/db.js';

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

      const { username, email, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      await pgsql.query(
         "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
         [username, email, hashedPassword]
      );

      console.log(`User ${username} (${email}) was registered successfully`);

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

      const { username: reqUsername, password } = req.body;
      const pgsqlLoginRes = await pgsql.query("SELECT * FROM users WHERE name = $1", [reqUsername]);

      if (pgsqlLoginRes.length === 0 || !(await bcrypt.compare(password, pgsqlLoginRes[0].password))) {
         console.log("invalid credentials");
         return res.status(401).json({ error: "invalid credentials" });
      }

      const { id, name: resUsername, email: resEmail, permissions: resPermissions } = pgsqlLoginRes[0];

      const token = jwt.sign(
         { 
            id,
            username: resUsername,
            email: resEmail,
            permissions: resPermissions
         },
         process.env.JWT_SECRET,
         { expiresIn: 60 * 60 * 24 * 30 }
      );

      console.log(`User ${resUsername} logged in successfully`);

      res.cookie("token", token, { 
         httpOnly: true,
         secure: process.env.NODE_ENV === "production",
         sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
      });
      res.json({ id, username: resUsername, email: resEmail, permissions: resPermissions });

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

export default router;
