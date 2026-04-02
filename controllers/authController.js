const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register
exports.register = (req, res) => {
  const { name, email, password, role } = req.body;

  const hashedPassword = bcrypt.hashSync(password, 8);

  const sql = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";

  db.query(sql, [name, email, hashedPassword, role], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "User registered" });
  });
};

// Login
exports.login = (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email=?", [email], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.length === 0)
      return res.status(404).json({ message: "User not found" });

    const user = result[0];

    const valid = bcrypt.compareSync(password, user.password);

    if (!valid)
      return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });
  });
};