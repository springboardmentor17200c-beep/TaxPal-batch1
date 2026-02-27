const mongoose = require('mongoose');

const TaxEstimateSchema = new mongoose.Schema({
  firebaseId: { type: String, required: true },
  country: { type: String, default: "India" },
  year: { type: Number, required: true },
  quarter: { type: String, enum: ['Q1', 'Q2', 'Q3', 'Q4'], required: true },
  income: { type: Number, required: true },
  deductions: { type: Number, default: 0 },
  estimatedTax: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'paid'], default: 'pending' }, 
}, { timestamps: true });

module.exports = mongoose.model('TaxEstimate', TaxEstimateSchema);