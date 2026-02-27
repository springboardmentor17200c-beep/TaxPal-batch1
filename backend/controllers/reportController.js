


const Report = require("../models/Report");
const Transaction = require("../models/Transaction");

exports.generateReport = async (req, res) => {
  try {
    const { firebaseId, reportType, period, format } = req.body;

    
    const transactions = await Transaction.find({ firebaseId });


    const totalIncome = transactions
      .filter(t => t.type && t.type.toLowerCase() === 'income')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    
    const totalExpenses = transactions
      .filter(t => t.type && t.type.toLowerCase() === 'expense')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const netProfit = totalIncome - totalExpenses;

    const newReport = new Report({
      firebaseId,
      reportName: `${reportType} - ${period}`,
      reportType,
      period,
      format: format || "PDF",
      status: "Completed",
      dataSnapshot: {
        totalIncome,
        totalExpenses,
        netProfit,
        transactionCount: transactions.length
      }
    });

    const savedReport = await newReport.save();
    res.status(201).json(savedReport);
  } catch (err) {
    console.error("Report Generation Error:", err);
    res.status(500).json({ message: "Error generating report", error: err.message });
  }
};

exports.getRecentReports = async (req, res) => {
  try {
    const { uid } = req.query;
    const reports = await Report.find({ firebaseId: uid }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: "Error fetching reports" });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    await Report.findByIdAndDelete(id);
    res.status(200).json({ message: "Report deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting report" });
  }
};