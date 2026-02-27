const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ['income', 'expense'], required: true },
    color: { type: String, default: '#3b82f6' },
    firebaseId: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Category', CategorySchema);