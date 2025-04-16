const jwt = require("jsonwebtoken");

// middleware to verify JWT token
// requires token in cookies or Authorization header
// if token is not present, or is invalid, will return 401 status code and error message
// if token is present, will verify token and decode it
// if token is valid, will return user data and call next middleware
const authMiddleware = (req, res, next) => {

   console.log("RUNNING AUTH MIDDLEWARE");

   let token = req.cookies.token;

   // Fallback to Authorization header
   if (!token && req.headers.authorization) {
      token = req.headers.authorization.split(" ")[1]; // Bearer <token>
   }

   if (!token) {
      console.log("No token found");
      return res.status(401).json({ error: "No valid JWT token" });
   }

   let decoded = null;

   try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
   } catch (error) {
      if (error.name === "TokenExpiredError") {
         console.log("Token expired");
         return res.status(401).json({ error: "Session expired. Please log in again." });
      }
      console.log("Token invalid");
      return res.status(401).json({ error: "Invalid token" });
   }

   console.log("auth middleware has authenticated JWT, decoded JWT is:");
   console.log(decoded);

   req.user = decoded;

   /**
    * req.user will be 
    * {
    *   id: (some number),
    *   email: (some email),
    *   userName: (some name),
    *   iat: (issued at time),
    *   exp: (expiration time),
    * }
    */

   next();
};
module.exports = authMiddleware;
