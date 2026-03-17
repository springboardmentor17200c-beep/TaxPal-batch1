
const TaxEstimate = require('../models/TaxEstimate');


const calculateNewRegimeTax = (annualIncome) => {
    const standardDeduction = 75000;
    let taxableIncome = Math.max(0, annualIncome - standardDeduction);

    let tax = 0;

    // Slab 1: Up to 4L → NIL
    if (taxableIncome <= 400000) return 0;

    // Slab 2: 4L - 8L (5%)
    if (taxableIncome > 400000) {
        tax += Math.min(taxableIncome - 400000, 400000) * 0.05;
    }

    // Slab 3: 8L - 12L (10%)
    if (taxableIncome > 800000) {
        tax += Math.min(taxableIncome - 800000, 400000) * 0.10;
    }

    // Slab 4: 12L - 16L (15%)
    if (taxableIncome > 1200000) {
        tax += Math.min(taxableIncome - 1200000, 400000) * 0.15;
    }

    // Slab 5: 16L - 20L (20%)
    if (taxableIncome > 1600000) {
        tax += Math.min(taxableIncome - 1600000, 400000) * 0.20;
    }

    // Slab 6: 20L - 24L (25%)
    if (taxableIncome > 2000000) {
        tax += Math.min(taxableIncome - 2000000, 400000) * 0.25;
    }

    // Slab 7: Above 24L (30%)
    if (taxableIncome > 2400000) {
        tax += (taxableIncome - 2400000) * 0.30;
    }

    // Add 4% Health & Education Cess
    return tax + (tax * 0.04);
};

exports.calculateTax = async (req, res) => {
    try {
        const { income, deductions, quarter, year, firebaseId } = req.body;

        if (!income || !firebaseId) {
            return res.status(400).json({ message: "Income and User ID are required." });
        }

        const annualIncome = Number(income);
        const userDeductions = Number(deductions) || 0;


        const estimatedTax = calculateNewRegimeTax(annualIncome);

        
        const newEstimate = new TaxEstimate({
            firebaseId,
            income: annualIncome,
            deductions: userDeductions,
            quarter: quarter || "Annual",
            year: year || "2025-26",
            estimatedTax: Math.round(estimatedTax),
            status: 'pending'
        });

        const savedEstimate = await newEstimate.save();
        res.status(201).json(savedEstimate);

    } catch (err) {
        
        console.error("TAX_CALCULATION_ERROR:", err);
        res.status(500).json({ 
            message: "Internal Server Error", 
            error: err.message 
        });
    }
};

exports.getTaxHistory = async (req, res) => {
    try {
        const { uid } = req.query;
        if (!uid) return res.status(400).json({ message: "User ID missing." });

        const history = await TaxEstimate.find({ firebaseId: uid }).sort({ createdAt: -1 });
        res.status(200).json(history);
    } catch (err) {
        console.error("FETCH_HISTORY_ERROR:", err);
        res.status(500).json({ message: "Error fetching history", error: err.message });
    }
};

exports.updateTaxStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updated = await TaxEstimate.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        );

        if (!updated) return res.status(404).json({ message: "Estimate not found" });
        res.status(200).json(updated);
    } catch (err) {
        console.error("UPDATE_STATUS_ERROR:", err);
        res.status(500).json({ message: "Error updating status", error: err.message });
    }
};   