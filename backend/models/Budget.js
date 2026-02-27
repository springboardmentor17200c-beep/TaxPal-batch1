const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema({
  firebaseId: { 
    type: String, 
    required: true 
  }, 
  category: { 
    type: String, 
    required: true 
  },

  type: {
    type: String,
    required: true,
    enum: ['income', 'expense'], 
    default: 'expense'
  },
  amount: { 
    type: Number, 
    required: true 
  },
  month: { 
    type: Date, 
    required: true 
  }, 
  description: { 
    type: String 
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Budget', BudgetSchema);