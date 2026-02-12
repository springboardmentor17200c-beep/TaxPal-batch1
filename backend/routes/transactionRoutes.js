const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/authMiddleware');

// @desc    Add a new transaction (Income or Expense)
// @route   POST /api/transactions
router.post('/', protect, async (req, res) => {
  try {
    // LOGGING: Check exactly what is arriving
    console.log("--- INCOMING REQUEST ---");
    console.log("Authenticated User UID:", req.user ? req.user.uid : "MISSING");
    console.log("Request Body:", req.body);

    const { type, category, amount, description, date } = req.body;

    // VALIDATION: Ensure the data is clean before hitting MongoDB
    if (!type || !category || !amount) {
        console.log("VALIDATION FAILED: Missing fields");
        return res.status(400).json({ message: "Type, Category, and Amount are required" });
    }

    const transaction = await Transaction.create({
      user_id: req.user.uid,
      type: type.toLowerCase(), 
      category: category,
      amount: Number(amount),
      description: description || "",
      date: date || Date.now()
    });

    console.log("SUCCESS: Transaction saved to DB");
    res.status(201).json(transaction);

  } catch (error) {
    console.error("DATABASE ERROR:", error.message);
    res.status(400).json({ 
        message: "Bad Request", 
        details: error.message 
    });
  }
});

// @desc    Get all transactions for the logged-in user
// @route   GET /api/transactions
router.get('/', protect, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user_id: req.user.uid }).sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    console.error("GET ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;