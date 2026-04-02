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
  const userId = req.user.id;

  // 1️⃣ Total Income & Expense
  const totalQuery = `
    SELECT 
      SUM(CASE WHEN type='income' THEN amount ELSE 0 END) AS totalIncome,
      SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) AS totalExpense
    FROM records
    WHERE user_id = ?
  `;

  // 2️⃣ Category-wise totals
  const categoryQuery = `
    SELECT category, SUM(amount) AS total
    FROM records
    WHERE user_id = ?
    GROUP BY category
  `;

  // 3️⃣ Recent activity (last 5)
  const recentQuery = `
    SELECT * FROM records
    WHERE user_id = ?
    ORDER BY date DESC
    LIMIT 5
  `;

  // 4️⃣ Monthly summary
  const monthlyQuery = `
    SELECT MONTH(date) AS month, SUM(amount) AS total
    FROM records
    WHERE user_id = ?
    GROUP BY MONTH(date)
  `;

  // Execute queries
  db.query(totalQuery, [userId], (err, totalResult) => {
    if (err) return res.status(500).json(err);

    db.query(categoryQuery, [userId], (err, categoryResult) => {
      if (err) return res.status(500).json(err);

      db.query(recentQuery, [userId], (err, recentResult) => {
        if (err) return res.status(500).json(err);

        db.query(monthlyQuery, [userId], (err, monthlyResult) => {
          if (err) return res.status(500).json(err);

          const totalIncome = totalResult[0].totalIncome || 0;
          const totalExpense = totalResult[0].totalExpense || 0;

          res.json({
            totalIncome,
            totalExpense,
            netBalance: totalIncome - totalExpense, // ✅ added
            categoryWise: categoryResult,           // ✅ added
            recentActivity: recentResult,           // ✅ added
            monthlySummary: monthlyResult           // ✅ added
          });
        });
      });
    });
  });
};  