
const express = require('express');
const router = express.Router();
const { 
    calculateTax, 
    getTaxHistory, 
    updateTaxStatus 
} = require('../controllers/taxController');

// Import your authentication middleware
// Note: This ensures req.user is populated and the user is logged in
const { protect } = require('../middleware/authMiddleware');

/**
 * @route   POST /api/tax/calculate
 * @desc    Calculate tax based on country slabs and upsert to MongoDB
 * @access  Private
 */
router.post('/calculate', protect, calculateTax);

/**
 * @route   GET /api/tax/history
 * @desc    Fetch all tax calculation history for a specific user
 * @access  Private
 */
router.get('/history', protect, getTaxHistory);

/**
 * @route   PATCH /api/tax/status/:id
 * @desc    Update the payment status (pending/paid) of a specific record
 * @access  Private
 */
router.patch('/status/:id', protect, updateTaxStatus);

module.exports = router;