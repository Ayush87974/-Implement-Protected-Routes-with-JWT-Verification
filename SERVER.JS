const express = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

const app = express();
const PORT = 5000;

// Middleware to parse JSON
app.use(bodyParser.json());

// Secret key for JWT (in production, store in env variable)
const JWT_SECRET = "mySuperSecretKey123";

// Hardcoded user for demo
const user = {
  username: "admin",
  password: "password123"
};

// ---------------------------
// LOGIN ROUTE
// ---------------------------
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Simple validation
  if (username === user.username && password === user.password) {
    // Generate JWT token
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });
    return res.json({ message: "Login successful", token });
  } else {
    return res.status(401).json({ message: "Invalid username or password" });
  }
});

// ---------------------------
// JWT VERIFY MIDDLEWARE
// ---------------------------
function verifyToken(req, res, next) {
  // Get token from header
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header missing" });
  }

  // Format: "Bearer token"
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  // Verify token
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    // Store decoded user info in request
    req.user = decoded;
    next();
  });
}

// ---------------------------
// PROTECTED ROUTE
// ---------------------------
app.get("/protected", verifyToken, (req, res) => {
  res.json({
    message: "Welcome to the protected route!",
    user: req.user
  });
});

// ---------------------------
// PUBLIC ROUTE
// ---------------------------
app.get("/", (req, res) => {
  res.send("Public route - no authentication required.");
});

// ---------------------------
// START SERVER
// ---------------------------
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
