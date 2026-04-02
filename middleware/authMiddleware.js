const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    // 1️⃣ Get token from header
    const authHeader = req.header("Authorization");

    // 2️⃣ Check if token exists
    if (!authHeader) {
      return res.status(401).json({ message: "No token, Unauthorized" });
    }

    // 3️⃣ Extract token (remove "Bearer ")
    const token = authHeader.split(" ")[1];

    // 4️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5️⃣ Attach user to request
    req.user = decoded;

    // 6️⃣ Next
    next();
  } catch (error) {
    console.error("Auth Error:", error);
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;