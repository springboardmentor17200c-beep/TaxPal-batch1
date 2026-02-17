const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  firebaseId: { type: String, required: true }, 
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  category: { type: String, required: true },
  date: { type: Date, default: Date.now },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);