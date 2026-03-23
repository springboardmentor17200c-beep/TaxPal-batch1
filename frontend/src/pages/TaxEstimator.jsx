

import React, { useState, useEffect, useCallback, useMemo } from "react";
import api from "../api/axios";
import { auth } from "../firebase/config"; 
import { onAuthStateChanged } from "firebase/auth";

const TaxEstimator = () => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [income, setIncome] = useState("");
  const [userId, setUserId] = useState(null);
  const [calculation, setCalculation] = useState(null);
  
  // --- GLOBAL STATE ---
  const [country, setCountry] = useState("India");
  const [selectedQuarter, setSelectedQuarter] = useState("Annual");
  const [deductions, setDeductions] = useState({});

  // --- RESPONSIVE LOGIC ---
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth < 1024;

  const params = {
    year: "2025-26",
    assessmentYear: "2026-27",
    regime: "New (Default)"
  };

  const countryConfig = {
    India: { currency: "₹", fields: { sec80C: "Section 80C (Max ₹1.5L)", sec80D: "Section 80D (Health Ins)", homeLoanInt: "Section 24b (Home Loan)", nps80CCD: "Section 80CCD (NPS)" } },
    "United States": { currency: "$", fields: { retirement401k: "401(k) Contribution", ira: "Traditional IRA", hsa: "Health Savings Account", mortgageInt: "Mortgage Interest" } },
    "United Kingdom": { currency: "£", fields: { pension: "Pension Contributions", charity: "Gift Aid Donations", isa: "Lifetime ISA Savings" } },
    Canada: { currency: "C$", fields: { rrsp: "RRSP Contribution", fhsa: "First Home Savings", childcare: "Child Care Expenses" } },
    Australia: { currency: "A$", fields: { super: "Voluntary Superannuation", workExpenses: "Work-Related Expenses", medicareLevy: "Medicare Levy Exemption" } }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user ? user.uid : null);
    });
    return () => unsubscribe();
  }, []);

  const fetchHistory = useCallback(async () => {
    if (!userId) return;
    try {
      // Corrected: Passing country to match updated controller logic
      const response = await api.get(`/tax/history?uid=${userId}&country=${country}`);
      setHistory(response.data);
      
      const latest = response.data.find(r => 
        r.quarter === selectedQuarter && 
        r.year === params.year && 
        r.country === country
      );
      
      if (latest) {
        setCalculation(latest);
        setIncome(latest.income.toString());
      } else {
        setCalculation(null);
        setIncome("");
      }
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  }, [userId, params.year, country, selectedQuarter]);

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
      const dbRecord = history.find(r => r.quarter === d.id && r.year === params.year && r.country === country);
      const isOverdue = new Date() > d.date;
      let displayStatus = "PENDING";
      
      if (dbRecord) {
        displayStatus = dbRecord.status === "paid" ? "PAID" : "SAVED (UNPAID)";
      } else if (isOverdue) {
        displayStatus = "OVERDUE";
      }
      return { ...d, status: displayStatus, amount: dbRecord ? dbRecord.estimatedTax : null };
    });
  }, [history, params.year, country]);

  const alertData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const unpaidItems = calendarData.filter(d => d.status !== "PAID");
    const activeDeadline = [...unpaidItems].reverse().find(d => {
      const diffTime = d.date.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 15;
    });

    if (!activeDeadline) return null;
    const diffDays = Math.ceil((activeDeadline.date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    return diffDays < 0 
      ? { message: `🚨 Overdue: ${activeDeadline.title} was due on ${activeDeadline.date.toLocaleDateString()}.`, type: 'danger' }
      : { message: `📅 Reminder: ${activeDeadline.title} is due in ${diffDays} days.`, type: 'warning' };
  }, [calendarData]);

  const handleCalculate = async () => {
    if (!userId || !income) return alert("Please login and enter income.");
    setLoading(true);
    
    const totalDeductions = Object.values(deductions).reduce((acc, curr) => acc + Number(curr || 0), 0);
    
    const payload = { 
      income: Number(income), 
      deductions: totalDeductions, 
      quarter: selectedQuarter, 
      year: params.year, 
      country: country,
      firebaseId: userId
    };

    try {
      const response = await api.post("/tax/calculate", payload);
      const updatedData = response.data;
      
      // OPTIMIZATION: Update local state immediately to reflect sync
      setCalculation(updatedData);
      setHistory(prev => {
        const exists = prev.findIndex(item => item.quarter === updatedData.quarter && item.country === updatedData.country);
        if (exists > -1) {
          const newHistory = [...prev];
          newHistory[exists] = updatedData;
          return newHistory;
        }
        return [updatedData, ...prev];
      });

    } catch (err) {
      alert("Error saving calculation. Please check your connection.");
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
      {alertData && (
        <div style={{
          ...alertBanner, 
          backgroundColor: alertData.type === 'danger' ? '#fee2e2' : '#fff7ed', 
          color: alertData.type === 'danger' ? '#991b1b' : '#9a3412', 
          border: `1px solid ${alertData.type === 'danger' ? '#fecaca' : '#fed7aa'}`,
        }}>
          <span>{alertData.type === 'danger' ? '🚨' : '⚠️'}</span>
          <span style={{marginLeft: '12px', flex: 1}}>{alertData.message}</span>
        </div>
      )}

      <header style={headerFlex}>
        <div>
          <h2 style={title}>Global Tax Ledger</h2>
          <p style={subtitle}>FY {params.year} • Live Sync: {country}</p>
        </div>
        <button style={secondaryBtn} onClick={() => setShowCalendar(!showCalendar)}>
          {showCalendar ? "🔙 Back to Form" : "📅 Compliance Calendar"}
        </button>
      </header>

      {!showCalendar ? (
        <div style={{...mainGrid, gridTemplateColumns: isTablet ? "1fr" : "1fr 380px"}}>
          <div style={{...card, padding: isMobile ? '20px' : '32px'}}>
            <h3 style={cardTitle}>Parameters & Logic</h3>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px'}}>
              <div style={inputGroup}>
                <label style={label}>Jurisdiction</label>
                <select style={input} value={country} onChange={(e) => {setCountry(e.target.value); setDeductions({});}}>
                   {Object.keys(countryConfig).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={inputGroup}>
                <label style={label}>Period</label>
                <select style={input} value={selectedQuarter} onChange={(e) => setSelectedQuarter(e.target.value)}>
                  <option value="Annual">Annual</option>
                  <option value="Q1">Q1</option><option value="Q2">Q2</option><option value="Q3">Q3</option><option value="Q4">Q4</option>
                </select>
              </div>
            </div>

            <div style={formGrid}>
              <div style={inputGroup}>
                <label style={label}>{selectedQuarter} Income</label>
                <div style={currencyWrapper}>
                  <span style={currencySymbol}>{countryConfig[country].currency}</span>
                  <input type="number" style={currencyInput} value={income} onChange={(e) => setIncome(e.target.value)} placeholder="0.00" />
                </div>
              </div>
              <h4 style={sectionDivider}>Regional Deductions ({country})</h4>
              <div style={{display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px'}}>
                {Object.entries(countryConfig[country].fields).map(([key, labelText]) => (
                  <div key={key} style={inputGroup}>
                    <label style={label}>{labelText}</label>
                    <input type="number" style={input} value={deductions[key] || ""} onChange={(e) => setDeductions({...deductions, [key]: e.target.value})} placeholder="0" />
                  </div>
                ))}
              </div>
            </div>
            <div style={btnContainer}>
              <button style={calculateBtn} onClick={handleCalculate} disabled={loading}>
                {loading ? "Syncing..." : `Calculate ${country} Tax`}
              </button>
            </div>
          </div>

          <div style={sidebar}>
            <div style={summaryCard}>
              <h3 style={cardTitle}>Current Projection</h3>
              {calculation ? (
                <div style={resultContainer}>
                  <div style={resultRow}><span>Total Income:</span><span style={boldVal}>{countryConfig[country].currency}{calculation.income.toLocaleString()}</span></div>
                  <div style={resultRow}><span>Total Deductions:</span><span style={boldVal}>- {countryConfig[country].currency}{calculation.deductions.toLocaleString()}</span></div>
                  <div style={{...resultRow, borderTop: '1px solid #e2e8f0', paddingTop: '15px', marginTop: '15px'}}>
                    <span style={{fontWeight: '700'}}>Est. Tax Payable:</span>
                    <span style={taxText}>{countryConfig[country].currency}{calculation.estimatedTax.toLocaleString()}</span>
                  </div>
                  <div style={{marginTop: '10px', fontSize: '11px', color: '#64748b', textAlign: 'right'}}>
                    Status: <span style={{color: calculation.status === 'paid' ? '#10b981' : '#f59e0b', fontWeight: 'bold'}}>{calculation.status.toUpperCase()}</span>
                  </div>
                </div>
              ) : <p style={summaryEmpty}>Enter details to see breakdown</p>}
            </div>
          </div>
        </div>
      ) : (
        <div style={calendarOverlay}>
           <div style={calendarHeader}>
             <h3 style={cardTitle}>Compliance Tracker</h3>
             <span style={syncBadge}>● {country} Active</span>
           </div>
           {calendarData.map((ev, i) => (
              <div key={i} style={{marginBottom: '15px'}}>
                <h4 style={monthHeader}>{ev.month}</h4>
                <div style={{...reminderItem, borderLeft: ev.status === "PAID" ? "4px solid #10b981" : (ev.status === "OVERDUE" ? "4px solid #ef4444" : "4px solid #f59e0b")}}>
                  <div style={{flex: 1}}>
                    <span style={eventTitle}>{ev.title}</span>
                    <div style={eventDate}>{ev.date.toDateString()}</div>
                    {ev.amount && <div style={dbAmount}>Saved: {countryConfig[country].currency}{ev.amount.toLocaleString()}</div>}
                  </div>
                  <span style={ev.status === "PAID" ? paidBadge : (ev.status === "OVERDUE" ? dangerBadge : paymentBadge)}>{ev.status}</span>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

// --- STYLES (Cleaned & Minimalist) ---
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
const input = { padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "14px" };
const currencyWrapper = { position: "relative" };
const currencySymbol = { position: "absolute", left: "12px", top: "12px", color: "#94a3b8" };
const currencyInput = { ...input, width: "100%", paddingLeft: "28px", fontWeight: "700", fontSize: "16px" };
const sectionDivider = { margin: "20px 0 10px 0", fontSize: "12px", fontWeight: "800", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px" };
const btnContainer = { display: "flex", justifyContent: "flex-end", marginTop: "30px" };
const calculateBtn = { padding: "14px 28px", background: "#0f172a", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "700" };
const sidebar = { display: "flex", flexDirection: "column", gap: "24px" };
const summaryCard = { ...card, padding: "24px", background: "#f8fafc" };
const resultRow = { display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "5px" };
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
const paymentBadge = { background: "#fff7ed", color: "#9a3412", padding: "6px 12px", borderRadius: "8px", fontSize: "10px", fontWeight: "800" };
const dangerBadge = { background: "#fee2e2", color: "#991b1b", padding: "6px 12px", borderRadius: "8px", fontSize: "10px", fontWeight: "800" };
const resultContainer = { display: "flex", flexDirection: "column" };
const summaryEmpty = { textAlign: 'center', color: '#94a3b8', padding: '30px', fontSize: '13px' };
const msgBox = { textAlign: 'center', padding: '100px' };

export default TaxEstimator;