



const TaxEstimate = require('../models/TaxEstimate');

// --- TAX CALCULATION UTILITIES ---

const calculateIndiaTax = (income) => {
    const standardDeduction = 75000;
    let taxableIncome = Math.max(0, income - standardDeduction);
    if (taxableIncome <= 1200000) return 0;

    let tax = 0;
    if (taxableIncome > 400000) tax += Math.min(taxableIncome - 400000, 400000) * 0.05;
    if (taxableIncome > 800000) tax += Math.min(taxableIncome - 800000, 400000) * 0.10;
    if (taxableIncome > 1200000) tax += Math.min(taxableIncome - 1200000, 400000) * 0.15;
    if (taxableIncome > 1600000) tax += Math.min(taxableIncome - 1600000, 400000) * 0.20;
    if (taxableIncome > 2000000) tax += Math.min(taxableIncome - 2000000, 400000) * 0.25;
    if (taxableIncome > 2400000) tax += (taxableIncome - 2400000) * 0.30;

    return tax + (tax * 0.04);
};

const calculateUSTax = (income) => {
    const stdDed = 15000;
    let taxable = Math.max(0, income - stdDed);
    let tax = 0;
    const slabs = [
        { limit: 11925, rate: 0.10 },
        { limit: 48475, rate: 0.12 },
        { limit: 103350, rate: 0.22 },
        { limit: 197300, rate: 0.24 },
        { limit: 250525, rate: 0.32 }
    ];
    let prevLimit = 0;
    for (let s of slabs) {
        if (taxable > prevLimit) {
            tax += (Math.min(taxable, s.limit) - prevLimit) * s.rate;
            prevLimit = s.limit;
        }
    }
    if (taxable > 250525) tax += (taxable - 250525) * 0.35;
    return tax;
};

const calculateUKTax = (income) => {
    const personalAllowance = 12570;
    let taxable = Math.max(0, income - personalAllowance);
    let tax = 0;
    if (taxable > 0) tax += Math.min(taxable, 37700) * 0.20;
    if (taxable > 37700) tax += (Math.min(taxable, 125140) - 37700) * 0.40;
    if (taxable > 125140) tax += (taxable - 125140) * 0.45;
    return tax;
};

const calculateCanadaTax = (income) => {
    let tax = 0;
    if (income > 0) tax += Math.min(income, 55867) * 0.15;
    if (income > 55867) tax += (Math.min(income, 111733) - 55867) * 0.205;
    if (income > 111733) tax += (Math.min(income, 173205) - 111733) * 0.26;
    if (income > 173205) tax += (income - 173205) * 0.29;
    return tax;
};

const calculateAustraliaTax = (income) => {
    let tax = 0;
    if (income > 18200) tax += (Math.min(income, 45000) - 18200) * 0.16;
    if (income > 45000) tax += (Math.min(income, 135000) - 45000) * 0.30;
    if (income > 135000) tax += (Math.min(income, 190000) - 135000) * 0.37;
    if (income > 190000) tax += (income - 190000) * 0.45;
    return tax + (income * 0.02);
};

// --- CONTROLLER ACTIONS ---

exports.calculateTax = async (req, res) => {
    try {
        const { income, deductions, quarter, year, firebaseId, country } = req.body;

        if (!income || !firebaseId || !country) {
            return res.status(400).json({ message: "Required fields missing." });
        }

        const annualIncome = Number(income);
        let estimatedTax = 0;

        switch (country) {
            case 'United States': estimatedTax = calculateUSTax(annualIncome); break;
            case 'United Kingdom': estimatedTax = calculateUKTax(annualIncome); break;
            case 'Canada': estimatedTax = calculateCanadaTax(annualIncome); break;
            case 'Australia': estimatedTax = calculateAustraliaTax(annualIncome); break;
            default: estimatedTax = calculateIndiaTax(annualIncome); break;
        }

        // Filter MUST match the unique index in your Schema
        const filter = { firebaseId, country, year, quarter };
        const update = {
            income: annualIncome,
            deductions: Number(deductions) || 0,
            estimatedTax: Math.round(estimatedTax),
            status: 'calculated' // Sets status to calculated on every update
        };

        const result = await TaxEstimate.findOneAndUpdate(filter, update, {
            new: true,
            upsert: true, 
            runValidators: true,
            setDefaultsOnInsert: true
        });

        res.status(200).json(result);

    } catch (err) {
        console.error("CALC_ERROR:", err);
        res.status(500).json({ message: "Database sync failed", error: err.message });
    }
};

exports.getTaxHistory = async (req, res) => {
    try {
        const { uid, country } = req.query; // Added country filter from query
        if (!uid) return res.status(400).json({ message: "User ID missing." });

        // Build search query
        const searchQuery = { firebaseId: uid };
        if (country) searchQuery.country = country;

        const history = await TaxEstimate.find(searchQuery).sort({ createdAt: -1 });
        res.status(200).json(history);
    } catch (err) {
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
        
        if (!updated) return res.status(404).json({ message: "Record not found" });
        res.status(200).json(updated);
    } catch (err) {
        res.status(500).json({ message: "Error updating status", error: err.message });
    }
};