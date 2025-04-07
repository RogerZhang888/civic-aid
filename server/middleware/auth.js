const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  // Check cookies first
  let token = req.cookies.token;
  
  // Fallback to Authorization header
  if (!token && req.headers.authorization) {
    token = req.headers.authorization.split(" ")[1]; // Bearer <token>
  }

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};
module.exports = auth;
