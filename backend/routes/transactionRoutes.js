const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget'); 
const { protect } = require('../middleware/authMiddleware');

// --- 1. RECORD NEW TRANSACTION ---
router.post('/', protect, async (req, res) => {
  try {
    console.log("--- INCOMING REQUEST ---");
    console.log("Authenticated User UID:", req.user ? req.user.uid : "MISSING");
    console.log("Request Body:", req.body);

    const { type, category, amount, description, date, notes } = req.body;

    if (!type || !category || !amount) {
        return res.status(400).json({ message: "Type, Category, and Amount are required" });
    }

    // FIXED: Changed user_id to firebaseId to match your Model Schema
    const transaction = await Transaction.create({
      firebaseId: req.user.uid, 
      type: type.toLowerCase(), 
      category: category,
      amount: Number(amount),
      description: description || "",
      date: date || Date.now(),
      notes: notes || ""
    });

    console.log("✅ SUCCESS: Transaction saved to DB");
    res.status(201).json(transaction);
  } catch (error) {
    console.error("❌ DATABASE ERROR:", error.message);
    res.status(400).json({ message: "Bad Request", details: error.message });
  }
});

// --- 2. GET ALL TRANSACTIONS ---
router.get('/', protect, async (req, res) => {
  try {
    // FIXED: Search by firebaseId
    const transactions = await Transaction.find({ firebaseId: req.user.uid }).sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- 3. EXPENSE BREAKDOWN (Pie Chart) ---
router.get('/breakdown', protect, async (req, res) => {
  try {
    const breakdown = await Transaction.aggregate([
      { $match: { firebaseId: req.user.uid, type: 'expense' } }, // FIXED: firebaseId
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" }
        }
      }
    ]);
    res.json(breakdown);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- 4. INCOME VS EXPENSES (Bar Chart) ---
router.get('/stats', protect, async (req, res) => {
  try {
    const stats = await Transaction.aggregate([
      { $match: { firebaseId: req.user.uid } }, // FIXED: firebaseId
      {
        $group: {
          _id: {
            month: { $month: "$date" },
            type: "$type"
          },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { "_id.month": 1 } }
    ]);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- 5. BUDGET SETTING ---
router.post('/budget', protect, async (req, res) => {
  try {
    const { category, amount, month, description } = req.body;
    const budget = await Budget.create({
      firebaseId: req.user.uid, // FIXED: firebaseId
      category,
      amount,
      month,
      description
    });
    res.status(201).json(budget);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// --- 6. DELETE TRANSACTION ---
router.delete('/:id', protect, async (req, res) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ message: "Transaction removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;