const User = require('../models/User');

// @desc    Register a new user in MongoDB
// @route   POST /api/users
exports.registerUser = async (req, res) => {
  try {
    const { firebaseId, name, email, country, income_bracket } = req.body;

    // Validation
    if (!firebaseId || !email) {
      return res.status(400).json({ message: "Firebase ID and Email are required" });
    }

    const newUser = new User({
      firebaseId,
      name,
      email,
      country,
      income_bracket
    });

    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
    
  } catch (err) {
    console.error("Controller Error:", err);
    res.status(500).json({ error: "Server error during user registration" });
  }
};