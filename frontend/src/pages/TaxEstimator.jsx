
import React, { useState, useEffect, useCallback } from "react";
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
  
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth < 1024;

  const [userId, setUserId] = useState(null);
  const [params, setParams] = useState({
    year: "2025-26",
    assessmentYear: "2026-27",
    regime: "New (Default)"
  });

  const [calculation, setCalculation] = useState(null);


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
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  }, [userId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);


  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCalculate = async () => {
    if (!userId) return alert("Please login first.");
    if (!income) return alert("Please enter your annual income.");
    
    setLoading(true);

    const totalDeductions = Object.values(deductions).reduce((acc, curr) => acc + Number(curr || 0), 0);
    
    const payload = {
      income: Number(income),
      deductions: totalDeductions,
      quarter: "Annual", 
      year: params.year,
      firebaseId: userId 
    };

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

  if (userId === null) {
    return (
      <div style={msgBox}>
        <h2 style={{color: "#1e293b"}}>Authentication Required</h2>
        <p style={{color: "#64748b"}}>Please sign in to access your Tax Estimator records.</p>
      </div>
    );
  }

  return (
    <div style={{...container, padding: isMobile ? "16px" : "32px"}}>
      <header style={headerFlex}>
        <div>
          <h2 style={title}>Annual Tax Estimator</h2>
          <p style={subtitle}>FY {params.year} | New Regime (AY {params.assessmentYear})</p>
        </div>
        {!showCalendar && (
          <button style={secondaryBtn} onClick={() => setShowCalendar(true)}>📅 View Compliance Calendar</button>
        )}
      </header>

      {showCalendar ? (
        <div style={calendarOverlay}>
          <div style={calendarHeader}>
            <h3 style={cardTitle}>Tax Calendar</h3>
            <button style={closeBtn} onClick={() => setShowCalendar(false)}>✕ Close</button>
          </div>

          <div style={calendarList}>
            {/* June 2025 Section */}
            <h4 style={monthHeader}>June 2025</h4>
            <div style={reminderItem}>
              <div style={{flex: 1}}>
                <span style={eventTitle}>Reminder: Q1 Advance Tax Payment</span>
                <div style={eventDate}>Jun 1, 2025</div>
                <p style={eventDesc}>Reminder for upcoming Q1 estimated tax payment due on Jun 15, 2025.</p>
              </div>
              <span style={reminderBadge}>reminder</span>
            </div>

            <div style={reminderItem}>
              <div style={{flex: 1}}>
                <span style={eventTitle}>Q1 Estimated Tax Payment</span>
                <div style={eventDate}>Jun 15, 2025</div>
                <p style={eventDesc}>First quarter estimated tax payment due (15%).</p>
              </div>
              <span style={paymentBadge}>payment</span>
            </div>

            {/* September 2025 Section */}
            <h4 style={monthHeader}>September 2025</h4>
            <div style={reminderItem}>
              <div style={{flex: 1}}>
                <span style={eventTitle}>Reminder: Q2 Advance Tax Payment</span>
                <div style={eventDate}>Sep 1, 2025</div>
                <p style={eventDesc}>Reminder for upcoming Q2 estimated tax payment due on Sep 15, 2025.</p>
              </div>
              <span style={reminderBadge}>reminder</span>
            </div>

            <div style={reminderItem}>
              <div style={{flex: 1}}>
                <span style={eventTitle}>Q2 Estimated Tax Payment</span>
                <div style={eventDate}>Sep 15, 2025</div>
                <p style={eventDesc}>Second quarter estimated tax payment due (45%).</p>
              </div>
              <span style={paymentBadge}>payment</span>
            </div>

            {/* 2026 Deadlines */}
            <h4 style={monthHeader}>March - July 2026</h4>
            <div style={reminderItem}>
              <div style={{flex: 1}}>
                <span style={eventTitle}>Advance Tax - Final Installment (Q4)</span>
                <div style={eventDate}>March 15, 2026</div>
                <p style={eventDesc}>Pay 100% of tax liability to avoid interest penalties.</p>
              </div>
              <span style={paymentBadge}>payment</span>
            </div>

            <div style={reminderItem}>
              <div style={{flex: 1}}>
                <span style={eventTitle}>ITR Filing Deadline (AY 2026-27)</span>
                <div style={eventDate}>July 31, 2026</div>
                <p style={eventDesc}>Standard deadline for salaried individuals (ITR-1/ITR-2).</p>
              </div>
              <span style={{...reminderBadge, backgroundColor: '#dbeafe', color: '#1d4ed8', border: '1px solid #bfdbfe'}}>filing</span>
            </div>
          </div>
        </div>
      ) : (
        <div style={{...mainGrid, gridTemplateColumns: isTablet ? "1fr" : "1fr 380px"}}>
          
          {/* Main Form Area */}
          <div style={{...card, padding: isMobile ? '20px' : '32px'}}>
            <h3 style={cardTitle}>Income & Yearly Deductions</h3>
            
            <div style={formGrid}>
              <div style={inputGroup}>
                <label style={label}>Annual Gross Salary / Income</label>
                <div style={currencyWrapper}>
                  <span style={currencySymbol}>₹</span>
                  <input 
                    type="number" 
                    style={currencyInput} 
                    placeholder="e.g. 15,00,000"
                    value={income} 
                    onChange={(e) => setIncome(e.target.value)} 
                  />
                </div>
                <p style={helperText}>Note: Standard Deduction of ₹75,000 is applied automatically in the New Regime.</p>
              </div>

              <h4 style={sectionDivider}>Tax Saving Deductions (Investments)</h4>
              
              <div style={{display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px'}}>
                <div style={inputGroup}>
                  <label style={label}>Section 80C (PPF, LIC, ELSS)</label>
                  <input type="number" style={input} placeholder="Max ₹1,50,000" 
                    value={deductions.sec80C} onChange={(e) => setDeductions({...deductions, sec80C: e.target.value})} />
                </div>

                <div style={inputGroup}>
                  <label style={label}>Section 80D (Health Insurance)</label>
                  <input type="number" style={input} placeholder="Self/Family/Parents" 
                    value={deductions.sec80D} onChange={(e) => setDeductions({...deductions, sec80D: e.target.value})} />
                </div>

                <div style={inputGroup}>
                  <label style={label}>Home Loan Interest (Sec 24b)</label>
                  <input type="number" style={input} placeholder="Interest component" 
                    value={deductions.homeLoanInt} onChange={(e) => setDeductions({...deductions, homeLoanInt: e.target.value})} />
                </div>

                <div style={inputGroup}>
                  <label style={label}>Education Loan Interest (80E)</label>
                  <input type="number" style={input} placeholder="No upper limit" 
                    value={deductions.sec80E} onChange={(e) => setDeductions({...deductions, sec80E: e.target.value})} />
                </div>

                <div style={inputGroup}>
                  <label style={label}>NPS (80CCD 1B / Corporate)</label>
                  <input type="number" style={input} placeholder="Additional deductions" 
                    value={deductions.nps80CCD} onChange={(e) => setDeductions({...deductions, nps80CCD: e.target.value})} />
                </div>

                <div style={inputGroup}>
                  <label style={label}>Donations / Other (80G)</label>
                  <input type="number" style={input} placeholder="Charity/Other" 
                    value={deductions.other} onChange={(e) => setDeductions({...deductions, other: e.target.value})} />
                </div>
              </div>
            </div>

            <div style={btnContainer}>
              <button style={calculateBtn} onClick={handleCalculate} disabled={loading}>
                {loading ? "Calculating..." : "Estimate Yearly Tax"}
              </button>
            </div>
          </div>
          
          {/* Sidebar Area */}
          <div style={sidebar}>
            <div style={summaryCard}>
              <h3 style={cardTitle}>Tax Projection</h3>
              {!calculation ? (
                <div style={summaryEmpty}>
                   <div style={{fontSize: '32px', marginBottom: '10px'}}>📊</div>
                   <p>Enter your details to see the projected tax liability.</p>
                </div>
              ) : (
                <div style={resultContainer}>
                  <div style={resultRow}><span>Gross Income:</span><span style={boldVal}>₹{calculation.income.toLocaleString()}</span></div>
                  <div style={resultRow}><span>Standard Deduction:</span><span style={{color: '#ef4444', fontWeight: '600'}}>-₹75,000</span></div>
                  
                  <div style={{...resultRow, borderTop: '1px solid #e2e8f0', paddingTop: '15px', marginTop: '10px'}}>
                    <span style={{fontWeight: '700', color: '#1e293b'}}>Total Tax Liability:</span>
                    <span style={taxText}>₹{calculation.estimatedTax.toLocaleString()}</span>
                  </div>
                  <p style={{fontSize: '11px', color: '#10b981', marginTop: '10px', textAlign: 'center'}}>
                    Includes 4% Cess & Sec 87A Rebate (if applicable)
                  </p>
                </div>
              )}
            </div>
            
            <div style={historyCard}>
              <h4 style={{fontSize: '14px', marginBottom: '15px', color: '#1e293b'}}>Recent Records</h4>
              {history.length > 0 ? history.slice(0, 3).map((item) => (
                <div key={item._id} style={historyItem}>
                  <div style={{display: 'flex', flexDirection: 'column'}}>
                    <span style={{fontWeight: '600'}}>FY {item.year}</span>
                    <span style={{fontSize: '11px', color: '#94a3b8'}}>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                  <strong style={{color: '#0f172a'}}>₹{item.estimatedTax.toLocaleString()}</strong>
                </div>
              )) : <p style={{fontSize: '12px', color: '#94a3b8', textAlign: 'center'}}>No previous calculations found.</p>}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

// --- STYLES ---
const container = { maxWidth: "1200px", margin: "0 auto", fontFamily: "Inter, sans-serif" };
const headerFlex = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" };
const title = { margin: 0, fontSize: "24px", fontWeight: "700", color: "#1e293b" };
const subtitle = { color: "#64748b", fontSize: "14px", marginTop: "4px" };
const secondaryBtn = { padding: "10px 18px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "14px", color: "#475569" };
const mainGrid = { display: "grid", gap: "32px" };
const card = { background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" };
const cardTitle = { fontSize: "16px", fontWeight: "700", marginBottom: "20px", color: "#1e293b" };
const formGrid = { display: "grid", gap: "24px" };
const inputGroup = { display: "flex", flexDirection: "column", gap: "8px" };
const label = { fontSize: "12px", fontWeight: "700", color: "#475569" };
const helperText = { fontSize: "11px", color: "#94a3b8", marginTop: "4px" };
const input = { padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "14px", outline: "none" };
const currencyWrapper = { position: "relative" };
const currencySymbol = { position: "absolute", left: "12px", top: "12px", color: "#94a3b8", fontWeight: "600" };
const currencyInput = { ...input, width: "100%", paddingLeft: "28px", fontWeight: "600", color: "#1e293b" };
const sectionDivider = { margin: "24px 0 8px 0", fontSize: "14px", fontWeight: "800", color: "#1e293b", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px", textTransform: "uppercase", letterSpacing: "0.5px" };
const btnContainer = { display: "flex", justifyContent: "flex-end", marginTop: "32px" };
const calculateBtn = { padding: "14px 28px", background: "#0f172a", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "15px" };
const sidebar = { display: "flex", flexDirection: "column", gap: "24px" };
const summaryCard = { ...card, padding: "28px", background: "#f8fafc", border: "1px solid #cbd5e1" };
const historyCard = { ...card, padding: "24px" };
const resultContainer = { display: "flex", flexDirection: "column", gap: "12px" };
const resultRow = { display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#475569" };
const boldVal = { fontWeight: "700", color: "#1e293b" };
const taxText = { fontSize: "22px", fontWeight: "900", color: "#0f172a" };
const historyItem = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f1f5f9" };
const calendarOverlay = { background: "#fff", padding: "32px", borderRadius: "12px", border: "1px solid #e2e8f0", minHeight: "400px" };
const calendarHeader = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", borderBottom: "1px solid #f1f5f9", paddingBottom: "16px" };
const closeBtn = { background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontWeight: "700", fontSize: "14px" };
const calendarList = { display: 'flex', flexDirection: 'column', gap: '15px' };
const eventTitle = { display: "block", fontWeight: "700", fontSize: "14px", color: "#1e293b" };
const eventDate = { fontSize: "13px", color: "#64748b", fontWeight: "600", marginTop: "2px" };
const eventDesc = { fontSize: '12px', color: '#64748b', marginTop: '5px' };
const summaryEmpty = { textAlign: "center", color: "#94a3b8", fontSize: "14px", padding: "40px 0" };
const msgBox = { textAlign: 'center', padding: '100px 20px', fontFamily: 'Inter, sans-serif' };

// NEW STYLES FOR THE UPDATED CALENDAR
const monthHeader = { fontSize: '14px', fontWeight: '700', color: '#1e293b', marginTop: '10px', marginBottom: '5px' };
const reminderItem = { 
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'flex-start', 
  padding: '16px', 
  background: '#fff', 
  borderRadius: '10px', 
  border: '1px solid #f1f5f9',
  boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
};
const reminderBadge = {
  fontSize: '11px',
  fontWeight: '600',
  padding: '4px 8px',
  borderRadius: '12px',
  background: '#f0f9ff',
  color: '#0369a1',
  border: '1px solid #e0f2fe'
};
const paymentBadge = {
  ...reminderBadge,
  background: '#fffbeb',
  color: '#b45309',
  border: '1px solid #fef3c7'
};

export default TaxEstimator;