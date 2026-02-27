const express = require("express");
const router = express.Router();

const { 
  generateReport, 
  getRecentReports, 
  deleteReport 
} = require("../controllers/reportController");

// Route to generate a new report
router.post("/generate", generateReport);

// Route to fetch all reports for a specific user
router.get("/recent", getRecentReports);

// ADD THIS: Route to delete a specific report by its ID
router.delete("/:id", deleteReport); 

module.exports = router;