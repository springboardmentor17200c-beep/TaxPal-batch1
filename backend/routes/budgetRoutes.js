const express = require('express');
const router = express.Router();
const Budget = require('../models/Budget');
const { protect } = require('../middleware/authMiddleware');
const budgetController = require('../controllers/budgetController');

// 1. GET ALL BUDGETS (With Spending/Income Calculation)
router.get('/', protect, budgetController.getBudgetsWithSpending);

// 2. SEARCH/FILTER BUDGETS
// This matches the frontend call: api.get("/budgets/search", { params: ... })
router.get('/search', protect, budgetController.searchBudgets);

// 3. CREATE NEW BUDGET (Updated with 'type')
router.post('/', protect, async (req, res) => {
  try {
    const { category, amount, month, description, type } = req.body;
    
    const newBudget = await Budget.create({
      firebaseId: req.user.uid,
      category,
      type: type || 'expense', // Fallback to 'expense' if not provided
      amount: Number(amount),
      month: month, // Mongoose schema will handle string to Date conversion
      description: description || ""
    });

    res.status(201).json(newBudget);
  } catch (error) {
    console.error("❌ BUDGET CREATION ERROR:", error.message);
    res.status(400).json({ message: error.message });
  }
});

// 4. DELETE BUDGET
router.delete('/:id', protect, async (req, res) => {
  try {
    const deletedBudget = await Budget.findOneAndDelete({ 
      _id: req.params.id, 
      firebaseId: req.user.uid 
    });

    if (!deletedBudget) {
      return res.status(404).json({ message: "Budget not found or unauthorized" });
    }

    res.json({ message: "Budget removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;