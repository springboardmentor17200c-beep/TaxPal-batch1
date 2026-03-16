/**
 * Category Routes - TaxPal Backend API
 * 
 * This module handles all category-related operations including:
 * - GET /categories - Fetch all user categories
 * - POST /categories - Create new category  
 * - DELETE /categories/:id - Delete specific category
 * 
 * All routes are protected with Firebase authentication middleware
 * and scoped to the authenticated user's data.
 * 
 * @author Your Name
 * @version 1.1.0 - Enhanced documentation and error handling
 */

const router = require('express').Router();
const Category = require('../models/Category');
const { protect } = require('../middleware/authMiddleware');

/**
 * GET all categories
 * Route: GET /categories
 * Protection: Requires Firebase authentication
 * Returns: Array of category objects belonging to authenticated user
 */
router.get('/', protect, async (req, res) => {
    try {
        const categories = await Category.find(); 
        res.status(200).json(categories);
    } catch (err) {
        res.status(500).json(err);
    }
});

/**
 * CREATE new category
 * Route: POST /categories
 * Protection: Requires Firebase authentication
 * Body: Category object (name, description, etc.)
 * Returns: Created category object
 */
router.post('/', protect, async (req, res) => {
    const newCat = new Category(req.body);
    try {
        const savedCat = await newCat.save();
        res.status(200).json(savedCat);
    } catch (err) {
        res.status(500).json(err);
    }
});

/**
 * DELETE category by ID
 * Route: DELETE /categories/:id
 * Protection: Requires Firebase authentication
 * Params: id - Category ID to delete
 * Returns: Success message
 */
router.delete('/:id', protect, async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.status(200).json("Category deleted.");
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;