const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

// ✅ Load env
dotenv.config();

// ✅ DB connection
require("./config/db");

// ✅ Initialize app FIRST
const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Routes (AFTER app is created)
const authRoutes = require("./routes/authRoutes");
const recordRoutes = require("./routes/recordRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/records", recordRoutes);

// ✅ Test route
app.get("/", (req, res) => {
  res.send("API Running...");
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));