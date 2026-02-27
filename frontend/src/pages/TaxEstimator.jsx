

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
    business: "",
    retirement: "",
    health: "",
    homeOffice: ""
  });
  

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth < 1024;

  const [userId, setUserId] = useState(null);
  const [params, setParams] = useState({
    year: 2026,
    quarter: "Q1 (Apr-Jun 2026)",
    state: "", 
    filingStatus: "Individual"
  });

  const [calculation, setCalculation] = useState(null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchHistory = useCallback(async () => {
    if (!userId) return;
    try {
      const response = await api.get(`/tax/history?uid=${userId}`);
      setHistory(response.data);
    } catch (err) {
      console.error("Failed to fetch tax history", err);
    }
  }, [userId]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleCalculate = async () => {
    if (!userId) return alert("Please login first.");
    if (!params.state) return alert("Please select a State/Province.");
    
    setLoading(true);
    const totalDeductions = Object.values(deductions).reduce((a, b) => Number(a) + Number(b), 0);
    
    const payload = {
      income: Number(income),
      deductions: totalDeductions,
      quarter: params.quarter.split(' ')[0],
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

  const getDueDate = (q, year) => {
    const dates = { 
        'Q1': `Jun 15, ${year}`, 
        'Q2': `Sep 15, ${year}`, 
        'Q3': `Dec 15, ${year}`, 
        'Q4': `Mar 15, ${year + 1}` 
    };
    return dates[q] || "TBD";
  };

  if (userId === null) {
    return (
        <div style={{padding: "100px 20px", textAlign: "center", fontFamily: "Inter, sans-serif"}}>
            <h2 style={{color: "#1e293b"}}>Authentication Required</h2>
            <p style={{color: "#64748b"}}>Please sign in to access your 2026 Tax Estimator records.</p>
        </div>
    );
  }

  return (
    <div style={{...container, padding: isMobile ? "16px" : "32px"}}>
      <header style={{
        ...headerFlex, 
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '20px' : '0'
      }}>
        <div>
          <h2 style={title}>Tax Estimator</h2>
          <p style={subtitle}>FY 2026-27 | ID: {userId.substring(0, 8)}...</p>
        </div>
        {!showCalendar && (
          <button style={{...secondaryBtn, width: isMobile ? '100%' : 'auto'}} onClick={() => setShowCalendar(true)}>
            📅 View Tax Calendar
          </button>
        )}
      </header>

      {showCalendar ? (
        <div style={{...calendarOverlay, padding: isMobile ? '20px' : '40px'}}>
          <div style={{...calendarHeader, flexDirection: isMobile ? 'column' : 'row', gap: '10px', alignItems: isMobile ? 'flex-start' : 'center'}}>
            <h3 style={cardTitle}>Tax Calendar</h3>
            <button style={closeBtn} onClick={() => setShowCalendar(false)}>✕ Close</button>
          </div>
          <div style={calendarList}>
            {history.length > 0 ? history.map((item) => (
              <div key={item._id} style={monthSection}>
                <h4 style={monthHeader}>
                    {getDueDate(item.quarter, item.year).split(' ')[0]} {item.quarter === 'Q4' ? item.year + 1 : item.year}
                </h4>
                <div style={eventCard}>
                  <div style={eventHeaderRow}>
                    <span style={eventTitle}>Reminder: {item.quarter} Payment</span>
                    <span style={reminderTag}>reminder</span>
                  </div>
                  <div style={eventDate}>{getDueDate(item.quarter, item.year).replace('15', '01')}</div>
                </div>
                <div style={eventCard}>
                  <div style={eventHeaderRow}>
                    <span style={eventTitle}>{item.quarter} Due Date</span>
                    <span style={paymentTag}>payment</span>
                  </div>
                  <div style={eventDate}>{getDueDate(item.quarter, item.year)}</div>
                  <div style={eventDesc}>Amount: ₹{item.estimatedTax.toLocaleString('en-IN')}</div>
                </div>
              </div>
            )) : <p style={emptyText}>No data synced.</p>}
          </div>
        </div>
      ) : (
        <div style={{...mainGrid, gridTemplateColumns: isTablet ? "1fr" : "1fr 380px"}}>
          <div style={{...card, padding: isMobile ? '20px' : '32px'}}>
            <h3 style={cardTitle}>Quarterly Tax Calculator</h3>
            <div style={{...formGrid, gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr"}}>
              <div style={inputGroup}><label style={label}>Country</label><select style={input} disabled><option>India</option></select></div>
              <div style={inputGroup}>
                <label style={label}>State/Province</label>
                <select style={input} value={params.state} onChange={(e) => setParams({...params, state: e.target.value})}>
                  <option value="" disabled>Select State</option>
                  <option>Delhi</option><option>Karnataka</option><option>Maharashtra</option><option>Tamilnadu</option><option>West Bengal</option>
                </select>
              </div>
              <div style={inputGroup}><label style={label}>Filing Status</label><select style={input}><option>Individual</option><option>HUF</option></select></div>
              <div style={inputGroup}>
                <label style={label}>Quarter</label>
                <select style={input} value={params.quarter} onChange={(e) => setParams({...params, quarter: e.target.value})}>
                  <option>Q1 (Apr-Jun 2026)</option><option>Q2 (Jul-Sep 2026)</option><option>Q3 (Oct-Dec 2026)</option><option>Q4 (Jan-Mar 2027)</option>
                </select>
              </div>
              <h4 style={sectionDivider}>Income</h4>
              <div style={{...inputGroup, gridColumn: isMobile ? "span 1" : "span 2"}}>
                <label style={label}>Gross Income</label>
                <div style={currencyWrapper}><span style={currencySymbol}>₹</span><input type="number" style={currencyInput} value={income} onChange={(e) => setIncome(e.target.value)} /></div>
              </div>
              <h4 style={sectionDivider}>Deductions</h4>
              <div style={inputGroup}><label style={label}>Business</label><input type="number" placeholder="₹ 0" style={input} onChange={(e) => setDeductions({...deductions, business: e.target.value})} /></div>
              <div style={inputGroup}><label style={label}>Retirement</label><input type="number" placeholder="₹ 0" style={input} onChange={(e) => setDeductions({...deductions, retirement: e.target.value})} /></div>
              <div style={inputGroup}><label style={label}>Health</label><input type="number" placeholder="₹ 0" style={input} onChange={(e) => setDeductions({...deductions, health: e.target.value})} /></div>
              <div style={inputGroup}><label style={label}>Office</label><input type="number" placeholder="₹ 0" style={input} onChange={(e) => setDeductions({...deductions, homeOffice: e.target.value})} /></div>
            </div>
            <div style={btnContainer}>
              <button style={{...calculateBtn, width: isMobile ? '100%' : 'auto'}} onClick={handleCalculate} disabled={loading}>{loading ? "Saving..." : "Calculate & Sync"}</button>
            </div>
          </div>
          
          <div style={sidebar}>
            <div style={summaryCard}>
              <h3 style={cardTitle}>Tax Summary</h3>
              {!calculation ? (
                <div style={summaryEmpty}><div style={summaryIcon}>📄</div><p style={emptyText}>Enter details to sync.</p></div>
              ) : (
                <div style={resultContainer}>
                  <div style={resultRow}><span>Taxable:</span><span style={boldText}>₹{calculation.income.toLocaleString('en-IN')}</span></div>
                  <div style={resultRow}><span>Estimated Tax:</span><span style={taxText}>₹{calculation.estimatedTax.toLocaleString('en-IN')}</span></div>
                  <p style={disclaimer}>✔ Sync successful</p>
                </div>
              )}
            </div>
            <div style={historyCard}>
              <h4 style={{fontSize: '14px', margin: '0 0 16px 0', color: '#1e293b'}}>Recent Records</h4>
              {history.length > 0 ? history.slice(0, 3).map((item) => (
                <div key={item._id} style={historyItem}>
                  <div style={statusDot}></div>
                  <div style={{flex: 1}}><div style={{fontWeight: '600', fontSize: '13px'}}>{item.quarter} {item.year}</div></div>
                  <div style={historyAmount}>₹{item.estimatedTax.toLocaleString()}</div>
                </div>
              )) : <p style={emptyText}>No data found.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- STYLES ---
const container = { maxWidth: "1200px", margin: "0 auto", fontFamily: "Inter, sans-serif" };
const headerFlex = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" };
const title = { margin: 0, fontSize: "24px", fontWeight: "700", color: "#1e293b" };
const subtitle = { color: "#64748b", fontSize: "14px", marginTop: "4px" };
const secondaryBtn = { padding: "10px 18px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", color: "#475569", fontWeight: "600", cursor: "pointer", fontSize: "14px" };
const mainGrid = { display: "grid", gap: "32px", alignItems: "start" };
const sidebar = { display: "flex", flexDirection: "column", gap: "24px" };
const card = { background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0" };
const cardTitle = { fontSize: "16px", fontWeight: "600", color: "#1e293b", margin: 0 };
const calendarOverlay = { background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", minHeight: "500px" };
const calendarHeader = { display: "flex", justifyContent: "space-between", marginBottom: "32px", borderBottom: "1px solid #f1f5f9", paddingBottom: "20px" };
const closeBtn = { background: "none", border: "none", color: "#ef4444", fontWeight: "600", cursor: "pointer" };
const calendarList = { display: "flex", flexDirection: "column", gap: "32px", maxWidth: "800px" };
const monthSection = { display: "flex", flexDirection: "column", gap: "12px" };
const monthHeader = { fontSize: "12px", fontWeight: "800", color: "#64748b", textTransform: "uppercase" };
const eventCard = { padding: "16px", border: "1px solid #f1f5f9", borderRadius: "8px", background: "#fcfcfc" };
const eventHeaderRow = { display: "flex", justifyContent: "space-between" };
const eventTitle = { fontSize: "14px", fontWeight: "600" };
const eventDate = { fontSize: "12px", color: "#64748b" };
const eventDesc = { fontSize: "12px", color: "#3b82f6", marginTop: "4px", fontWeight: "500" };
const reminderTag = { fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "10px", background: "#eff6ff", color: "#3b82f6" };
const paymentTag = { fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "10px", background: "#fffbeb", color: "#d97706" };
const formGrid = { display: "grid", gap: "20px" };
const inputGroup = { display: "flex", flexDirection: "column", gap: "8px" };
const label = { fontSize: "12px", fontWeight: "600", color: "#64748b" };
const input = { padding: "10px 12px", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "14px" };
const sectionDivider = { gridColumn: "span 2", margin: "16px 0 8px 0", fontSize: "13px", fontWeight: "700" };
const currencyWrapper = { position: "relative" };
const currencySymbol = { position: "absolute", left: "12px", top: "11px", color: "#94a3b8" };
const currencyInput = { ...input, width: "100%", paddingLeft: "24px" };
const btnContainer = { display: "flex", justifyContent: "flex-end", marginTop: "32px" };
const calculateBtn = { padding: "12px 24px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "pointer" };
const summaryCard = { ...card, padding: "32px", minHeight: "200px" };
const historyCard = { ...card, padding: "24px" };
const summaryEmpty = { textAlign: "center", paddingTop: "40px" };
const summaryIcon = { fontSize: "32px", color: "#e2e8f0" };
const emptyText = { fontSize: "12px", color: "#94a3b8" };
const resultContainer = { display: "flex", flexDirection: "column", gap: "12px" };
const resultRow = { display: "flex", justifyContent: "space-between", fontSize: "14px" };
const boldText = { fontWeight: "700" };
const taxText = { fontWeight: "700", fontSize: "16px" };
const disclaimer = { fontSize: "11px", color: "#10b981" };
const historyItem = { display: "flex", alignItems: "center", gap: "10px", padding: "8px 0", borderBottom: "1px solid #f1f5f9" };
const statusDot = { width: "6px", height: "6px", borderRadius: "50%", background: "#3b82f6" };
const historyAmount = { fontWeight: "600", fontSize: "13px" };

export default TaxEstimator;