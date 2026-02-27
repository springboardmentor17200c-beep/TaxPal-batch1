const TaxEstimate = require('../models/TaxEstimate');

exports.calculateTax = async (req, res) => {
  try {
    const { income, deductions, quarter, year, firebaseId } = req.body;

    const taxableIncome = Math.max(0, income - deductions);
    const estimatedTax = taxableIncome * 0.20; 

    const newEstimate = new TaxEstimate({
      firebaseId,
      income,
      deductions,
      quarter,
      year,
      estimatedTax,
      status: 'pending' 
    });

    const savedEstimate = await newEstimate.save();
    res.status(201).json(savedEstimate);
  } catch (err) {
    res.status(500).json({ message: "Error calculating tax", error: err.message });
  }
};

exports.getTaxHistory = async (req, res) => {
  try {
    const { uid } = req.query;
    const history = await TaxEstimate.find({ firebaseId: uid }).sort({ createdAt: -1 });
    res.status(200).json(history);
  } catch (err) {
    res.status(500).json({ message: "Error fetching history", error: err.message });
  }
};

exports.updateTaxStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await TaxEstimate.findByIdAndUpdate(
      id, 
      { status }, 
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Estimate not found" });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error updating status", error: err.message });
  }
};