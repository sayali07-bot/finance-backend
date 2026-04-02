const db = require("../config/db");

// ✅ Create Record
exports.createRecord = (req, res) => {
  const { amount, type, category, date, notes } = req.body;

  if (!amount || !type || !category) {
    return res.status(400).json({ message: "All fields required" });
  }

  const sql =
    "INSERT INTO records (amount, type, category, date, notes, user_id) VALUES (?, ?, ?, ?, ?, ?)";

  db.query(
    sql,
    [amount, type, category, date, notes, req.user.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Record created successfully" });
    }
  );
};

// ✅ Get Records
exports.getRecords = (req, res) => {
  let { type, category } = req.query;

  let sql = "SELECT * FROM records WHERE 1=1";

  if (type) {
    sql += ` AND type='${type}'`;
  }

  if (category) {
    sql += ` AND category='${category}'`;
  }

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

// ✅ Summary
exports.getSummary = (req, res) => {
  const incomeQuery =
    "SELECT SUM(amount) AS totalIncome FROM records WHERE type='income'";
  const expenseQuery =
    "SELECT SUM(amount) AS totalExpense FROM records WHERE type='expense'";

  db.query(incomeQuery, (err, incomeResult) => {
    if (err) return res.status(500).json(err);

    db.query(expenseQuery, (err, expenseResult) => {
      if (err) return res.status(500).json(err);

      const totalIncome = incomeResult[0].totalIncome || 0;
      const totalExpense = expenseResult[0].totalExpense || 0;

      res.json({
        totalIncome,
        totalExpense,
        netBalance: totalIncome - totalExpense,
      });
    });
  });
};

// ✅ Category Summary
exports.categorySummary = (req, res) => {
  const sql =
    "SELECT category, SUM(amount) as total FROM records GROUP BY category";

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};