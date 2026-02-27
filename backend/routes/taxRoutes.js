const router = require('express').Router();
const { calculateTax, getTaxHistory, updateTaxStatus } = require('../controllers/taxController');

router.post('/calculate', calculateTax);
router.get('/history', getTaxHistory);
router.patch('/:id/status', updateTaxStatus); 

module.exports = router;