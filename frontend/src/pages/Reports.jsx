


import React, { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import { auth } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [reports, setReports] = useState([]);
  const [previewReport, setPreviewReport] = useState(null);

 
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const isMobile = windowWidth < 768;

  const [formData, setFormData] = useState({
    reportType: "Income Statement",
    period: "Current Month",
    format: "PDF",
  });

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchReports = useCallback(async () => {
    if (!userId) return;
    try {
      const response = await api.get(`/reports/recent?uid=${userId}`);
      setReports(response.data);
    } catch (err) {
      console.error("Error fetching reports:", err);
    }
  }, [userId]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user ? user.uid : null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (userId) fetchReports();
  }, [userId, fetchReports]);

  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const handleGenerate = async () => {
    if (!userId) return alert("Please login first");
    setLoading(true);
    try {
      const payload = { firebaseId: userId, ...formData };
      const response = await api.post("/reports/generate", payload);
      if (response.data.dataSnapshot?.transactionCount === 0) {
        alert("Report generated, but no transactions were found.");
      }
      setPreviewReport(response.data);
      fetchReports(); 
    } catch (err) {
      alert("Failed to generate report.");
    } finally {
      setLoading(false);
    }
  };

  const handleView = (report) => {
    setPreviewReport(report);
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;
    try {
      await api.delete(`/reports/${id}`);
      if (previewReport?._id === id) setPreviewReport(null);
      fetchReports();
    } catch (err) {
      alert("Failed to delete report.");
    }
  };

  const handleDownload = () => {
    if (!previewReport) return;
    const data = previewReport.dataSnapshot || {};
    const reportContent = `TAX PAL FINANCIAL REPORT\nReport: ${previewReport.reportName}\nTotal Income: ${formatINR(data.totalIncome)}`;
    const blob = new Blob([reportContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${previewReport.reportName.replace(/\s+/g, '_')}.txt`;
    link.click();
  };

  const handlePrint = () => window.print();

  const handleReset = () => {
    setFormData({ reportType: "Income Statement", period: "Current Month", format: "PDF" });
    setPreviewReport(null);
  };

  if (!userId) return <div style={centered}>Please sign in to view reports.</div>;

  return (
    <div style={{...container, padding: isMobile ? '16px' : '32px'}}>
      <h2 style={headerTitle}>Financial Reports</h2>
      <p style={headerSubtitle}>Generate and manage your financial history for 2026 (INR)</p>

     
      <div style={card}>
        <h3 style={cardTitle}>Generate New Report</h3>
        <div style={{...formRow, gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr"}}>
          <div style={inputGroup}>
            <label style={label}>Report Type</label>
            <select style={select} value={formData.reportType} onChange={(e) => setFormData({...formData, reportType: e.target.value})}>
              <option>Income Statement</option>
              <option>Tax Summary</option>
              <option>Expense Report</option>
            </select>
          </div>
          <div style={inputGroup}>
            <label style={label}>Period</label>
            <select style={select} value={formData.period} onChange={(e) => setFormData({...formData, period: e.target.value})}>
              <option>Current Month</option>
              <option>Last Quarter</option>
              <option>FY 2026-27</option>
            </select>
          </div>
          <div style={inputGroup}>
            <label style={label}>Format</label>
            <select style={select} value={formData.format} onChange={(e) => setFormData({...formData, format: e.target.value})}>
              <option>PDF</option><option>CSV</option><option>TXT</option>
            </select>
          </div>
        </div>
        <div style={{...buttonRow, flexDirection: isMobile ? 'column-reverse' : 'row'}}>
          <button style={{...resetBtn, width: isMobile ? '100%' : 'auto'}} onClick={handleReset}>Reset</button>
          <button style={{...generateBtn, width: isMobile ? '100%' : 'auto'}} onClick={handleGenerate} disabled={loading}>
            {loading ? "Generating..." : "Generate Report"}
          </button>
        </div>
      </div>

  
      <div style={{...card, overflowX: 'auto'}}>
        <h3 style={cardTitle}>Recent Reports History</h3>
        <div style={{ minWidth: isMobile ? '600px' : '100%' }}>
          <table style={table}>
            <thead>
              <tr style={tableHeaderRow}>
                <th style={th}>Report Name</th>
                <th style={th}>Generated</th>
                <th style={th}>Period</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.length > 0 ? reports.map((report) => (
                <tr key={report._id} style={tableRow}>
                  <td style={td}>{report.reportName}</td>
                  <td style={td}>{new Date(report.createdAt).toLocaleDateString()}</td>
                  <td style={td}>{report.period}</td>
                  <td style={td}>
                    <div style={{ display: 'flex', gap: '15px' }}>
                      <button style={actionBtn} onClick={() => handleView(report)}>View</button>
                      <button style={{ ...actionBtn, color: '#ef4444' }} onClick={() => handleDelete(report._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="4" style={noResults}>No report history found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

     
      <div style={card}>
        <div style={{...previewHeader, flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: '15px'}}>
          <h3 style={cardTitle}>Detailed Report Preview</h3>
          {previewReport && (
            <div style={{...previewActions, width: isMobile ? '100%' : 'auto'}}>
              <button style={{...printBtn, flex: isMobile ? 1 : 'none'}} onClick={handlePrint}>Print</button>
              <button style={{...downloadBtn, flex: isMobile ? 1 : 'none'}} onClick={handleDownload}>Download</button>
            </div>
          )}
        </div>
        
        <div style={previewContent}>
          {!previewReport ? (
            <div style={emptyPreview}>
              <div style={emptyIcon}>📄</div>
              <p style={emptyText}>Select a report to preview data</p>
            </div>
          ) : (
            <div style={activePreview}>
               <h4 style={{margin: '0', color: '#1e293b'}}>{previewReport.reportName}</h4>
               <p style={{fontSize: '12px', color: '#64748b', marginBottom: '20px'}}>Generated on: {new Date(previewReport.createdAt).toLocaleString()}</p>
               
               <div style={{...reportGrid, gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr"}}>
                  <div style={statBox}>
                    <span style={statLabel}>Total Income</span>
                    <span style={{...statValue, color: '#10b981'}}>{formatINR(previewReport.dataSnapshot?.totalIncome)}</span>
                  </div>
                  <div style={statBox}>
                    <span style={statLabel}>Total Expenses</span>
                    <span style={{...statValue, color: '#ef4444'}}>{formatINR(previewReport.dataSnapshot?.totalExpenses)}</span>
                  </div>
                  <div style={{...statBox, borderLeft: '4px solid #3b82f6', background: '#f0f9ff'}}>
                    <span style={statLabel}>Net Profit</span>
                    <span style={statValue}>{formatINR(previewReport.dataSnapshot?.netProfit)}</span>
                  </div>
               </div>

               <div style={footerNote}>
                  <p style={{margin: '0 0 5px 0'}}><strong>Audit Summary:</strong></p>
                  <p style={{margin: 0}}>Transactions processed: {previewReport.dataSnapshot?.transactionCount || 0}</p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- STYLES (PRESERVED) ---
const container = { maxWidth: "1100px", margin: "0 auto", fontFamily: "'Inter', system-ui, sans-serif" };
const headerTitle = { margin: 0, fontSize: "24px", fontWeight: "700", color: "#1e293b" };
const headerSubtitle = { color: "#64748b", fontSize: "14px", marginTop: "4px", marginBottom: "32px" };
const card = { background: "#fff", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" };
const cardTitle = { fontSize: "12px", fontWeight: "700", color: "#64748b", marginBottom: "20px", textTransform: "uppercase", letterSpacing: "0.05em" };
const formRow = { display: "grid", gap: "20px" };
const inputGroup = { display: "flex", flexDirection: "column", gap: "8px" };
const label = { fontSize: "12px", fontWeight: "600", color: "#64748b" };
const select = { padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "14px", backgroundColor: "#fff", cursor: "pointer", width: '100%', boxSizing: 'border-box' };
const buttonRow = { display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" };
const resetBtn = { padding: "10px 20px", background: "#f1f5f9", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer", fontSize: "14px", color: "#475569" };
const generateBtn = { padding: "10px 20px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer", fontSize: "14px" };
const table = { width: "100%", borderCollapse: "collapse" };
const tableHeaderRow = { borderBottom: "1px solid #f1f5f9" };
const th = { textAlign: "left", padding: "12px", fontSize: "12px", color: "#64748b", fontWeight: "600" };
const td = { padding: "12px", fontSize: "13px", color: "#1e293b", borderBottom: "1px solid #f8fafc" };
const tableRow = { transition: "background 0.2s" };
const noResults = { textAlign: "center", padding: "30px", color: "#94a3b8", fontSize: "14px" };
const actionBtn = { background: "none", border: "none", color: "#3b82f6", cursor: "pointer", fontWeight: "600", fontSize: "13px", padding: 0 };
const previewHeader = { display: "flex", justifyContent: "space-between", marginBottom: "20px" };
const previewActions = { display: "flex", gap: "10px" };
const printBtn = { padding: "8px 16px", border: "1px solid #e2e8f0", background: "#fff", borderRadius: "6px", cursor: "pointer", fontSize: "13px" };
const downloadBtn = { padding: "8px 16px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px" };
const previewContent = { background: "#f8fafc", borderRadius: "8px", minHeight: "260px", display: "flex", justifyContent: "center", alignItems: "center", border: "1px solid #f1f5f9" };
const emptyPreview = { textAlign: "center", color: "#94a3b8" };
const emptyIcon = { fontSize: "40px", marginBottom: "8px" };
const emptyText = { fontSize: "14px", fontWeight: "500" };
const activePreview = { width: "100%", padding: "24px", background: "#fff", borderRadius: "8px", boxSizing: 'border-box' };
const reportGrid = { display: "grid", gap: "16px", marginTop: "10px" };
const statBox = { padding: "16px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" };
const statLabel = { fontSize: "11px", color: "#64748b", marginBottom: "6px", textTransform: "uppercase", fontWeight: "600" };
const statValue = { fontSize: "20px", fontWeight: "700", color: "#1e293b" };
const footerNote = { marginTop: "24px", padding: "16px", background: "#f8fafc", borderRadius: "8px", fontSize: "13px", color: "#475569", border: "1px solid #e2e8f0" };
const centered = { display: "flex", justifyContent: "center", alignItems: "center", height: "80vh", color: "#64748b" };

export default Reports;