const router = require('express').Router();
const Category = require('../models/Category');


router.get('/', async (req, res) => {
    try {
        const categories = await Category.find(); 
        res.status(200).json(categories);
    } catch (err) {
        res.status(500).json(err);
    }
});

router.post('/', async (req, res) => {
    const newCat = new Category(req.body);
    try {
        const savedCat = await newCat.save();
        res.status(200).json(savedCat);
    } catch (err) {
        res.status(500).json(err);
    }
});


router.delete('/:id', async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.status(200).json("Category deleted.");
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;