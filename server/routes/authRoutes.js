const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");
const { neon, NeonDbError } = require("@neondatabase/serverless");

const saltRounds = 10;

const sql = neon(process.env.DATABASE_URL);

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
      await sql.query(
         "INSERT INTO Users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
         [name, email, hashedPassword]
      );

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

      const { email: reqEmail, password } = req.body;
      const sqlLoginRes = await sql.query("SELECT * FROM Users WHERE email = $1", [reqEmail]);

      // this is an array of rows that match query
      // sqlLoginRes = [
      //    {
      //      id: 17,
      //      name: 'qwertyuiop',
      //      password: '$2b$10$lqcBkJQxzOIX3LWiLmlYP.oIJcdijYILBqgglmvmu4D1vAJYqsHOa',
      //      email: 'jhwang0324@gmail.com',
      //      singpass_verified: false
      //    }
      // ]
      // if user exists, will have length 1
      // will have id, name, password, email, singpass_verified fields

      console.log(sqlLoginRes);

      if (sqlLoginRes.length === 0 || !(await bcrypt.compare(password, sqlLoginRes[0].password))) {
         console.log("invalid credentials");
         return res.status(401).json({ error: "invalid credentials" });
      }

      const { id, name: userName, email: resEmail } = sqlLoginRes[0];

      const token = jwt.sign(
         { 
            id,
            userName: userName,
            email: resEmail
         },
         process.env.JWT_SECRET,
         { expiresIn: "1000h" }
      );

      console.log(`HELLO USER ${resEmail}!!!`);

      res.cookie("token", token, { 
         httpOnly: true,
         secure: process.env.NODE_ENV === "production",
         sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
      });
      res.json({ id, userName, email: resEmail });

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
router.post('/logout', auth, (req, res) => {

   console.log("RUNNING LOGOUT HANDLER");

   res.clearCookie("token", {
     httpOnly: true,
     secure: process.env.NODE_ENV === 'production',
     sameSite: 'strict',
   });
 
   res.json({ success: true });
});

/**
 * @route   GET /protected
 * @desc    Example of a protected route. Returns authenticated user's data.
 * @access  Private
 * @returns 200 with user data if authenticated
 */
router.get("/protected", auth, (req, res) => {
   res.json(req.user);
});

module.exports = router;
