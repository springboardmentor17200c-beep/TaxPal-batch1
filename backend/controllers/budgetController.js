const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

// 1. ORIGINAL FUNCTION: GET ALL BUDGETS WITH CALCULATED SPENDING
exports.getBudgetsWithSpending = async (req, res) => {
  try {
    const firebaseId = req.user.uid;
    const budgets = await Budget.find({ firebaseId }).lean();

    const budgetsWithSpent = await Promise.all(budgets.map(async (budget) => {
      const startOfMonth = new Date(budget.month);
      const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0, 23, 59, 59);

      const result = await Transaction.aggregate([
        {
          $match: {
            firebaseId: firebaseId,
            category: budget.category,
            // Dynamically match transaction type to budget type
            type: budget.type || 'expense', 
            date: { $gte: startOfMonth, $lte: endOfMonth }
          }
        },
        {
          $group: {
            _id: null,
            totalSpent: { $sum: "$amount" }
          }
        }
      ]);

      return {
        ...budget,
        spent: result.length > 0 ? result[0].totalSpent : 0
      };
    }));

    res.status(200).json(budgetsWithSpent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. NEW LOGIC: SEARCH/FILTER BUDGETS
exports.searchBudgets = async (req, res) => {
  try {
    const firebaseId = req.user.uid;
    const { category, type, month } = req.query;

    const query = { firebaseId };

    if (type) query.type = type;
    if (category) query.category = category;

    // Handle Month Filtering (Matches YYYY-MM string to Date range)
    if (month) {
      const start = new Date(`${month}-01`);
      const end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59);
      query.month = { $gte: start, $lte: end };
    }

    const budgets = await Budget.find(query).sort({ createdAt: -1 });
    res.status(200).json(budgets);
  } catch (err) {
    res.status(500).json({ error: "Search failed: " + err.message });
  }
};

// 3. NEW LOGIC: CREATE BUDGET (Including Type)
exports.createBudget = async (req, res) => {
  try {
    const { category, amount, month, description, type } = req.body;
    
    const newBudget = new Budget({
      firebaseId: req.user.uid,
      category,
      type: type || 'expense', // Default to expense if not provided
      amount,
      month: new Date(month), // Ensures string "2026-02" becomes a Date object
      description
    });

    const savedBudget = await newBudget.save();
    res.status(201).json(savedBudget);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// 4. DELETE BUDGET
exports.deleteBudget = async (req, res) => {
    try {
      await Budget.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: "Budget deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
};