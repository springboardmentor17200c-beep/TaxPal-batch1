


const Transaction = require('../models/Transaction');

// 1. Record New Income/Expense (CRITICAL FIX FOR VALIDATION ERROR)
exports.addTransaction = async (req, res) => {
  try {
    // A. Log the request so you can see it in the terminal
    console.log("--- INCOMING REQUEST TO SAVE ---");
    console.log("Body content:", req.body);

    // B. Extract properties from body
    const { description, amount, type, category, date, notes } = req.body;
    
    // C. Resolve firebaseId from two possible sources (Token or Body)
    const firebaseId = req.user ? req.user.uid : req.body.firebaseId;

    // D. Validation Check before hitting Mongoose
    if (!firebaseId) {
      console.error("BLOCKING SAVE: No firebaseId detected.");
      return res.status(400).json({ error: "Identification failed: No firebaseId found." });
    }

    // E. Manually construct the object to ensure "firebaseId" is the key
    const newTx = new Transaction({
      firebaseId: firebaseId, // Force the value here
      description: description,
      amount: Number(amount), // Ensure it's a number
      type: type,
      category: category,
      date: date || Date.now(),
      notes: notes || ""
    });

    // F. Final Save
    await newTx.save();
    console.log("✅ SUCCESS: Transaction saved for UID:", firebaseId);
    res.status(201).json(newTx);

  } catch (err) {
    console.error("❌ DATABASE SAVE ERROR:", err.message);
    res.status(500).json({ error: "Failed to save: " + err.message });
  }
};

// 2. Get All Transactions
exports.getTransactions = async (req, res) => {
  try {
    // If you are using middleware that puts uid in req.user, use that.
    // Otherwise, expect it as a query parameter from the frontend.
    const firebaseId = req.user ? req.user.uid : req.query.firebaseId;

    if (!firebaseId) {
      return res.status(400).json({ error: "Identification failed: Missing UID." });
    }

    const transactions = await Transaction.find({ firebaseId }).sort({ date: -1 });
    res.status(200).json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. Data for the Pie Chart (Expense Breakdown)
exports.getExpenseBreakdown = async (req, res) => {
  try {
    const firebaseId = req.user ? req.user.uid : req.query.firebaseId;

    const breakdown = await Transaction.aggregate([
      { $match: { firebaseId: firebaseId, type: 'expense' } },
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" }
        }
      }
    ]);

    res.status(200).json(breakdown);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4. Data for the Bar Chart (Income vs Expenses)
exports.getMonthlyStats = async (req, res) => {
  try {
    const firebaseId = req.user ? req.user.uid : req.query.firebaseId;

    const stats = await Transaction.aggregate([
      { $match: { firebaseId: firebaseId } },
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

    res.status(200).json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};