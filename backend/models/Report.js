const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema({
  firebaseId: { 
    type: String, 
    required: true, 
    index: true 
  },
  reportName: { 
    type: String, 
    required: true 
  }, 
  reportType: { 
    type: String, 
    enum: ["Income Statement", "Tax Summary", "Expense Report"], 
    required: true 
  },
  period: { 
    type: String, 
    required: true 
  }, 
  format: { 
    type: String, 
    enum: ["PDF", "CSV", "JSON"],
    default: "PDF" 
  },
  status: { 
    type: String, 
    default: "Completed" 
  },
  dataSnapshot: { type: Object, default: {} },
  fileUrl: { 
    type: String 
  } 
}, {    
  timestamps: true 
});

module.exports = mongoose.model("Report", ReportSchema);