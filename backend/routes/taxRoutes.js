

const express = require('express');
const router = express.Router();
const { calculateTax, getTaxHistory, updateTaxStatus } = require('../controllers/taxController');
const { protect } = require('../middleware/authMiddleware'); 


router.post('/calculate', protect, calculateTax);


router.get('/history', protect, getTaxHistory);

router.patch('/:id/status', protect, updateTaxStatus);

module.exports = router;