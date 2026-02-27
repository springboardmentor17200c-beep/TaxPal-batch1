
const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget'); 
const { protect } = require('../middleware/authMiddleware');

// --- 1. RECORD NEW TRANSACTION ---
router.post('/', protect, async (req, res) => {
  try {
    const { type, category, amount, description, date, notes } = req.body;

    if (!type || !category || !amount) {
        return res.status(400).json({ message: "Type, Category, and Amount are required" });
    }

    const transaction = await Transaction.create({
      firebaseId: req.user.uid, 
      type: type.toLowerCase(), 
      category: category,
      amount: Number(amount),
      description: description || "",
      date: date || Date.now(),
      notes: notes || ""
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ message: "Bad Request", details: error.message });
  }
});

// --- 2. GET ALL TRANSACTIONS ---
router.get('/', protect, async (req, res) => {
  try {
    const transactions = await Transaction.find({ firebaseId: req.user.uid }).sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- 3. UPDATED: EXPENSE BREAKDOWN (Pie Chart with Percentages) ---
router.get('/breakdown', protect, async (req, res) => {
  try {
    const breakdown = await Transaction.aggregate([
      // 1. Match only this user's expenses
      { $match: { firebaseId: req.user.uid, type: 'expense' } },
      
      // 2. Group by category to get sums
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" }
        }
      },

      // 3. Group again to calculate the 'Grand Total' of all expenses
      {
        $group: {
          _id: null,
          totalAll: { $sum: "$totalAmount" },
          categories: { $push: { category: "$_id", amount: "$totalAmount" } }
        }
      },

      // 4. Unwind the categories and calculate the percentage for each
      { $unwind: "$categories" },
      {
        $project: {
          _id: 0,
          category: "$categories.category",
          amount: "$categories.amount",
          percentage: { 
            $cond: [
              { $eq: ["$totalAll", 0] }, 
              0, 
              { $multiply: [{ $divide: ["$categories.amount", "$totalAll"] }, 100] }
            ]
          }
        }
      },
      // 5. Sort by highest spending
      { $sort: { amount: -1 } }
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
      { $match: { firebaseId: req.user.uid } }, 
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
      firebaseId: req.user.uid,
      category,
      amount: Number(amount),
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