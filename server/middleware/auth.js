const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
   // Check cookies first
   let token = req.cookies.token;

   // Fallback to Authorization header
   if (!token && req.headers.authorization) {
      token = req.headers.authorization.split(" ")[1]; // Bearer <token>
   }

   if (!token) return res.status(401).json({ error: "Unauthorized" });

   let decoded = null;
   try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
   } catch (error) {
      res.status(401).json({ error: "Invalid token" });
   }
   console.log(`Authenticated JWT ${decoded}`);
   if (!decoded) {
      res.status(401).json({ error: "Token not decoded" });
   }
   req.user = decoded;

   next();
};
module.exports = auth;
