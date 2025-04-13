const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");
const { neon } = require("@neondatabase/serverless");

const saltRounds = 10;

const sql = neon(process.env.DATABASE_URL);

// Register
router.post("/register", async (req, res) => {
   console.log("REGISTRATION HANDLER");

   try {
      const { name, email, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      const result = await sql.query(
         "INSERT INTO Users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
         [name, email, hashedPassword]
      );

      console.log(result);

      res.status(201).json(result.rows[0]);
   } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
   }
});

// Login
router.post("/login", async (req, res) => {

   console.log("LOGIN HANDLER");

   try {
      const { email: reqEmail, password } = req.body;
      const sqlRes = await sql.query("SELECT * FROM Users WHERE email = $1", [reqEmail]);

      // array of rows that match query
      // res = [
      //    {
      //      id: 17,
      //      name: 'qwertyuiop',
      //      password: '$2b$10$lqcBkJQxzOIX3LWiLmlYP.oIJcdijYILBqgglmvmu4D1vAJYqsHOa',
      //      email: 'jhwang0324@gmail.com',
      //      singpass_verified: false
      //    }
      // ]
      // if user exists, res will have length 1
      // res[0] will have id, name, password, email, singpass_verified fields
      console.log(sqlRes);

      if (sqlRes.length === 0 || !(await bcrypt.compare(password, sqlRes[0].password))) {
         console.log("invalid credentials");
         return sqlRes.status(401).json({ error: "INVALID CREDS" });
      }

      const { id, name: userName, email: resEmail } = sqlRes[0];

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

// Protected route example
router.get("/protected", auth, (req, res) => {
   res.json(req.user);
});

module.exports = router;
