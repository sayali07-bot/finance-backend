const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  createRecord,
  getRecords,
  getSummary,
} = require("../controllers/recordController");

// Protected routes
router.post("/", authMiddleware, createRecord);
router.get("/", authMiddleware, getRecords);
router.get("/summary", authMiddleware, getSummary);

module.exports = router;