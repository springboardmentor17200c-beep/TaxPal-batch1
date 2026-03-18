
import React, { useState, useEffect, useCallback, useMemo } from "react";
import api from "../api/axios";
import { auth } from "../firebase/config"; 
import { onAuthStateChanged } from "firebase/auth";

const TaxEstimator = () => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [income, setIncome] = useState("");
  
  const [deductions, setDeductions] = useState({
    sec80C: "",      
    sec80D: "",      
    sec80E: "",      
    sec80G: "",      
    homeLoanInt: "", 
    nps80CCD: "",    
    other: ""        
  });

  const fieldDescriptions = {
    sec80C: "Investments in PPF, ELSS, LIC, and School Fees (Max ₹1.5L).",
    sec80D: "Medical insurance premiums for self and parents.",
    sec80E: "Interest paid on Higher Education loans.",
    sec80G: "Donations to charitable institutions and relief funds.",
    homeLoanInt: "Interest portion of your Home Loan EMI (Sec 24b).",
    nps80CCD: "Additional contributions to National Pension System.",
    other: "Any other valid tax-saving investments."
  };
  
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth < 1024;

  const [userId, setUserId] = useState(null);
  const [params] = useState({
    year: "2025-26",
    assessmentYear: "2026-27",
    regime: "New (Default)"
  });

  const [calculation, setCalculation] = useState(null);

  // --- AUTH & DATA LOGIC ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user ? user.uid : null);
    });
    return () => unsubscribe();
  }, []);

  const fetchHistory = useCallback(async () => {
    if (!userId) return;
    try {
      const response = await api.get(`/tax/history?uid=${userId}`);
      setHistory(response.data);
      
      const latestAnnual = response.data.find(r => r.quarter === "Annual" && r.year === params.year);
      if (latestAnnual && !income) {
        setCalculation(latestAnnual);
        setIncome(latestAnnual.income.toString());
      }
    } catch (err) {
      console.error("Failed to fetch MongoDB history", err);
    }
  }, [userId, params.year, income]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const calendarData = useMemo(() => {
    const deadlines = [
      { id: "Q1", month: "June 2025", title: "Q1 Advance Tax (15%)", date: new Date(2025, 5, 15) },
      { id: "Q2", month: "September 2025", title: "Q2 Advance Tax (45%)", date: new Date(2025, 8, 15) },
      { id: "Q3", month: "December 2025", title: "Q3 Advance Tax (75%)", date: new Date(2025, 11, 15) },
      { id: "Q4", month: "March 2026", title: "Q4 Final Tax (100%)", date: new Date(2026, 2, 15) },
      { id: "Annual", month: "July 2026", title: "ITR Filing Deadline", date: new Date(2026, 6, 31) },
    ];

    return deadlines.map(d => {
      const dbRecord = history.find(r => r.quarter === d.id && r.year === params.year);
      const isOverdue = new Date() > d.date;
      
      let displayStatus = "PENDING";
      if (dbRecord) {
        displayStatus = dbRecord.isPaid ? "PAID" : "SAVED (UNPAID)";
      } else if (isOverdue) {
        displayStatus = "OVERDUE";
      }

      return { ...d, status: displayStatus, amount: dbRecord ? dbRecord.estimatedTax : null };
    });
  }, [history, params.year]);

  // --- ALERT LOGIC ---
  const alertData = useMemo(() => {
    const today = new Date();
    const activeDeadline = calendarData.find(d => {
      const diffDays = Math.ceil((d.date - today) / (1000 * 60 * 60 * 24));
      // Alert if not paid and within 10 days before or 5 days after
      return d.status !== "PAID" && diffDays <= 10 && diffDays >= -5;
    });

    if (!activeDeadline) return null;
    const isPast = today > activeDeadline.date;
    return {
      message: isPast 
        ? `Urgent: ${activeDeadline.title} was due on ${activeDeadline.date.toLocaleDateString()}`
        : `Reminder: ${activeDeadline.title} is due in ${Math.ceil((activeDeadline.date - today) / (1000 * 60 * 60 * 24))} days`,
      type: isPast ? 'danger' : 'warning'
    };
  }, [calendarData]);

  const handleCalculate = async () => {
    if (!userId) return alert("Please login first.");
    if (!income) return alert("Please enter your annual income.");
    setLoading(true);
    const totalDeductions = Object.values(deductions).reduce((acc, curr) => acc + Number(curr || 0), 0);
    const payload = { income: Number(income), deductions: totalDeductions, quarter: "Annual", year: params.year, firebaseId: userId };

    try {
      const response = await api.post("/tax/calculate", payload);
      setCalculation(response.data);
      fetchHistory(); 
    } catch (err) {
      alert("Error saving calculation.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (userId === null) return <div style={msgBox}><h2>Authentication Required</h2></div>;

  return (
    <div style={{...container, padding: isMobile ? "16px" : "32px"}}>
      
      {/* Alert Banner Section */}
      {alertData && (
        <div style={{
          ...alertBanner, 
          backgroundColor: alertData.type === 'danger' ? '#fee2e2' : '#fff7ed', 
          color: alertData.type === 'danger' ? '#991b1b' : '#9a3412', 
          border: `1px solid ${alertData.type === 'danger' ? '#fecaca' : '#fed7aa'}`
        }}>
          <span>{alertData.type === 'danger' ? '🚨' : '⚠️'}</span>
          <span style={{marginLeft: '12px'}}>{alertData.message}</span>
        </div>
      )}

      <header style={headerFlex}>
        <div>
          <h2 style={title}>Tax Estimator</h2>
          <p style={subtitle}>FY {params.year} • Cloud Synced</p>
        </div>
        <button style={secondaryBtn} onClick={() => setShowCalendar(!showCalendar)}>
          {showCalendar ? "🔙 Back to Form" : "📅 Compliance Calendar"}
        </button>
      </header>

      {!showCalendar ? (
        <div style={{...mainGrid, gridTemplateColumns: isTablet ? "1fr" : "1fr 380px"}}>
          <div style={{...card, padding: isMobile ? '20px' : '32px'}}>
            <h3 style={cardTitle}>Calculate Liability</h3>
            <div style={formGrid}>
              
              <div style={inputGroup}>
                <label style={label}>Annual Gross Income</label>
                <div style={currencyWrapper}>
                  <span style={currencySymbol}>₹</span>
                  <input type="number" style={currencyInput} value={income} onChange={(e) => setIncome(e.target.value)} placeholder="0.00" />
                </div>
                <small style={helperText}>Your total yearly earnings before any taxes or deductions.</small>
              </div>

              <h4 style={sectionDivider}>Tax Saving Deductions</h4>
              
              <div style={{display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px'}}>
                {Object.keys(deductions).map(key => (
                  <div key={key} style={inputGroup}>
                    <label style={label}>{key.replace(/([A-Z])/g, ' $1').toUpperCase()}</label>
                    <input type="number" style={input} value={deductions[key]} onChange={(e) => setDeductions({...deductions, [key]: e.target.value})} placeholder="0" />
                    <small style={helperText}>{fieldDescriptions[key]}</small>
                  </div>
                ))}
              </div>
            </div>

            <div style={btnContainer}>
              <button style={calculateBtn} onClick={handleCalculate} disabled={loading}>
                {loading ? "Processing..." : "Calculate & Save to Cloud"}
              </button>
            </div>
          </div>

          <div style={sidebar}>
            <div style={summaryCard}>
              <h3 style={cardTitle}>Projection</h3>
              {calculation ? (
                <div style={resultContainer}>
                  <div style={resultRow}><span>Total Income:</span><span style={boldVal}>₹{calculation.income.toLocaleString()}</span></div>
                  <div style={{...resultRow, borderTop: '1px solid #e2e8f0', paddingTop: '15px', marginTop: '15px'}}>
                    <span style={{fontWeight: '700'}}>Tax Payable:</span>
                    <span style={taxText}>₹{calculation.estimatedTax.toLocaleString()}</span>
                  </div>
                </div>
              ) : <p style={summaryEmpty}>Enter your details to generate a projection</p>}
            </div>
          </div>
        </div>
      ) : (
        <div style={calendarOverlay}>
           <div style={calendarHeader}>
             <h3 style={cardTitle}>Status Tracker</h3>
             <span style={syncBadge}>● Live MongoDB Sync</span>
           </div>
           {calendarData.map((ev, i) => (
              <div key={i} style={{marginBottom: '15px'}}>
                <h4 style={monthHeader}>{ev.month}</h4>
                <div style={{...reminderItem, borderLeft: ev.status === "PAID" ? "4px solid #10b981" : "4px solid #e2e8f0"}}>
                  <div style={{flex: 1}}>
                    <span style={eventTitle}>{ev.title}</span>
                    <div style={eventDate}>{ev.date.toDateString()}</div>
                    {ev.amount && <div style={dbAmount}>Saved Amount: ₹{ev.amount.toLocaleString()}</div>}
                  </div>
                  <span style={ev.status === "PAID" ? paidBadge : (ev.status === "OVERDUE" ? dangerBadge : paymentBadge)}>
                    {ev.status}
                  </span>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

// --- STYLES ---
const container = { maxWidth: "1200px", margin: "0 auto", fontFamily: "Inter, sans-serif" };
const headerFlex = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" };
const title = { margin: 0, fontSize: "24px", fontWeight: "800", color: "#0f172a" };
const subtitle = { color: "#64748b", fontSize: "14px" };
const secondaryBtn = { padding: "10px 18px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", cursor: "pointer", fontWeight: "600", fontSize: "13px", color: "#475569" };
const mainGrid = { display: "grid", gap: "32px" };
const card = { background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" };
const cardTitle = { fontSize: "15px", fontWeight: "700", marginBottom: "20px" };
const formGrid = { display: "grid", gap: "24px" };
const inputGroup = { display: "flex", flexDirection: "column", gap: "6px" };
const label = { fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" };
const helperText = { fontSize: "11px", color: "#94a3b8", lineHeight: "1.4", marginTop: "2px" };
const input = { padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "14px" };
const currencyWrapper = { position: "relative" };
const currencySymbol = { position: "absolute", left: "12px", top: "12px", color: "#94a3b8" };
const currencyInput = { ...input, width: "100%", paddingLeft: "28px", fontWeight: "700", fontSize: "16px" };
const sectionDivider = { margin: "20px 0 10px 0", fontSize: "12px", fontWeight: "800", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px" };
const btnContainer = { display: "flex", justifyContent: "flex-end", marginTop: "30px" };
const calculateBtn = { padding: "14px 28px", background: "#0f172a", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "700" };
const sidebar = { display: "flex", flexDirection: "column", gap: "24px" };
const summaryCard = { ...card, padding: "24px", background: "#f8fafc" };
const resultRow = { display: "flex", justifyContent: "space-between", fontSize: "14px" };
const boldVal = { fontWeight: "700" };
const taxText = { fontSize: "28px", fontWeight: "900", color: "#0f172a" };
const alertBanner = { padding: "16px", borderRadius: "12px", marginBottom: "24px", display: "flex", alignItems: "center", fontWeight: "600", fontSize: "14px" };
const calendarOverlay = { background: "#fff", padding: "32px", borderRadius: "16px", border: "1px solid #e2e8f0" };
const calendarHeader = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" };
const syncBadge = { fontSize: "11px", color: "#10b981", fontWeight: "700", background: "#f0fdf4", padding: "4px 10px", borderRadius: "20px" };
const monthHeader = { fontSize: "12px", color: "#94a3b8", marginBottom: "8px" };
const reminderItem = { display: "flex", justifyContent: "space-between", padding: "18px", background: "#fff", borderRadius: "12px", border: "1px solid #f1f5f9" };
const eventTitle = { fontWeight: "700", fontSize: "14px", color: "#1e293b" };
const eventDate = { fontSize: "12px", color: "#64748b" };
const dbAmount = { fontSize: "11px", color: "#10b981", fontWeight: "700", marginTop: "4px" };
const paidBadge = { background: "#dcfce7", color: "#166534", padding: "6px 12px", borderRadius: "8px", fontSize: "10px", fontWeight: "800" };
const paymentBadge = { ...paidBadge, background: "#f1f5f9", color: "#475569" };
const dangerBadge = { ...paidBadge, background: "#fee2e2", color: "#991b1b" };
const resultContainer = { display: "flex", flexDirection: "column" };
const summaryEmpty = { textAlign: 'center', color: '#94a3b8', padding: '30px', fontSize: '13px' };
const msgBox = { textAlign: 'center', padding: '100px' };

export default TaxEstimator;