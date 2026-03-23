

const mongoose = require('mongoose');

const TaxEstimateSchema = new mongoose.Schema({
  firebaseId: { 
    type: String, 
    required: true,
    index: true 
  },
  country: { 
    type: String, 
    required: true,
    // Matches the 5 regions in your frontend countryConfig
    enum: ['India', 'United States', 'United Kingdom', 'Canada', 'Australia'],
    default: "India" 
  },
  year: { 
    type: String, 
    required: true 
  },
  quarter: { 
    type: String, 
    enum: ['Q1', 'Q2', 'Q3', 'Q4', 'Annual'], 
    required: true 
  },
  income: { 
    type: Number, 
    required: true 
  },
  deductions: { 
    type: Number, 
    default: 0 
  },
  estimatedTax: { 
    type: Number, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'paid', 'calculated'], 
    default: 'pending' 
  }, 
}, { 
  timestamps: true 
});

/**
 * Composite Index
 * Ensures one unique record per User + Country + Year + Quarter.
 * If a user recalculates for the same period, MongoDB will prevent 
 * duplicate entries, allowing you to use 'upsert' logic in the controller.
 */
TaxEstimateSchema.index({ firebaseId: 1, country: 1, year: 1, quarter: 1 }, { unique: true });

module.exports = mongoose.model('TaxEstimate', TaxEstimateSchema);