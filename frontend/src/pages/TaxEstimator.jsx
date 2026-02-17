import React, { useState } from "react";

const TaxEstimator = () => {
  const [income, setIncome] = useState("");
  const [deductions, setDeductions] = useState({
    section80C: "",
    section80D: "",
    hra: "",
    other: ""
  });
  const [calculation, setCalculation] = useState(null);

  const handleCalculate = () => {
   
    const totalDeductions = Object.values(deductions).reduce((a, b) => Number(a) + Number(b), 0);
    const taxableIncome = Math.max(0, Number(income) - totalDeductions);
    
    const estimatedTax = taxableIncome * 0.20; 
    setCalculation({ taxableIncome, estimatedTax });
  };

  return (
    <div style={container}>
      <header style={header}>
        <h2 style={title}>Income Tax Estimator</h2>
        <p style={subtitle}>Calculate your estimated tax obligations (FY 2025-26)</p>
      </header>

      <div style={mainGrid}>
      
        <div style={card}>
          <h3 style={cardTitle}>Tax Calculator (India)</h3>
          <div style={formGrid}>
            <div style={inputGroup}>
              <label style={label}>Assessment Year</label>
              <select style={input}><option>AY 2026-27</option></select>
            </div>
            <div style={inputGroup}>
              <label style={label}>State / UT</label>
              <select style={input}>
                <option>Karnataka</option>
                <option>Maharashtra</option>
                <option>Tamil Nadu</option>
                <option>Delhi</option>
             
              </select>
            </div>
            <div style={inputGroup}>
              <label style={label}>Tax Regime</label>
              <select style={input}>
                <option>New Regime (Section 115BAC)</option>
                <option>Old Regime</option>
              </select>
            </div>
            <div style={inputGroup}>
              <label style={label}>Age Group</label>
              <select style={input}>
                <option>Below 60 years</option>
                <option>60 - 80 years (Senior)</option>
              </select>
            </div>
            
            <div style={{...inputGroup, gridColumn: "span 2"}}>
              <label style={label}>Annual Gross Salary / Income</label>
              <div style={currencyWrapper}>
                <span style={currencySymbol}>₹</span>
                <input 
                  type="number" 
                  placeholder="0.00" 
                  style={currencyInput} 
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                />
              </div>
            </div>

            <h4 style={sectionHeader}>Exemptions & Deductions (Old Regime)</h4>
            <div style={inputGroup}>
              <label style={label}>80C (LIC, PPF, ELSS)</label>
              <input 
                type="number" 
                placeholder="₹ 0.00" 
                style={input} 
                onChange={(e) => setDeductions({...deductions, section80C: e.target.value})}
              />
            </div>
            <div style={inputGroup}>
              <label style={label}>80D (Health Insurance)</label>
              <input 
                type="number" 
                placeholder="₹ 0.00" 
                style={input} 
                onChange={(e) => setDeductions({...deductions, section80D: e.target.value})}
              />
            </div>
            <div style={inputGroup}>
              <label style={label}>HRA Exemption</label>
              <input 
                type="number" 
                placeholder="₹ 0.00" 
                style={input} 
                onChange={(e) => setDeductions({...deductions, hra: e.target.value})}
              />
            </div>
            <div style={inputGroup}>
              <label style={label}>Standard Deduction</label>
              <input type="number" value="50000" disabled style={{...input, backgroundColor: '#f1f5f9'}} />
            </div>
          </div>
          <button style={calculateBtn} onClick={handleCalculate}>Calculate Estimated Tax</button>
        </div>

        <div style={summaryCard}>
          <h3 style={cardTitle}>Tax Summary</h3>
          {!calculation ? (
            <div style={summaryEmpty}>
              <div style={summaryIcon}>📊</div>
              <p>Enter your income details to see your tax breakdown.</p>
            </div>
          ) : (
            <div style={resultContainer}>
               <div style={resultRow}>
                  <span>Taxable Income:</span>
                  <span style={boldText}>₹{calculation.taxableIncome.toLocaleString('en-IN')}</span>
               </div>
               <div style={resultRow}>
                  <span>Estimated Tax:</span>
                  <span style={taxText}>₹{calculation.estimatedTax.toLocaleString('en-IN')}</span>
               </div>
               <p style={disclaimer}>*Estimates based on current slab rates excluding Cess.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- STYLES ---
const container = { animation: "fadeIn 0.4s ease" };
const header = { marginBottom: "24px" };
const title = { margin: 0, fontSize: "24px", fontWeight: "700", color: "#0f172a" };
const subtitle = { color: "#64748b", fontSize: "14px" };
const mainGrid = { display: "grid", gridTemplateColumns: "1fr 350px", gap: "24px", alignItems: "start" };
const card = { background: "#fff", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0" };
const cardTitle = { fontSize: "16px", fontWeight: "600", marginBottom: "20px", color: "#1e293b" };
const formGrid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" };
const inputGroup = { display: "flex", flexDirection: "column", gap: "6px" };
const label = { fontSize: "12px", fontWeight: "600", color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" };
const input = { padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "14px", outline: "none", color: "#1e293b" };
const currencyWrapper = { position: "relative" };
const currencySymbol = { position: "absolute", left: "12px", top: "10px", color: "#64748b", fontWeight: "bold" };
const currencyInput = { ...input, width: "100%", paddingLeft: "28px" };
const sectionHeader = { gridColumn: "span 2", margin: "20px 0 10px 0", fontSize: "13px", color: "#3b82f6", fontWeight: "700", borderBottom: "1px solid #eff6ff", paddingBottom: "5px" };
const calculateBtn = { marginTop: "24px", width: "100%", padding: "12px", background: "#0f172a", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" };
const summaryCard = { ...card, minHeight: "350px", background: "#f8fafc" };
const summaryEmpty = { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", color: "#94a3b8", paddingTop: "60px" };
const summaryIcon = { fontSize: "48px", marginBottom: "16px" };
const resultContainer = { display: "flex", flexDirection: "column", gap: "16px" };
const resultRow = { display: "flex", justifyContent: "space-between", fontSize: "15px", padding: "12px 0", borderBottom: "1px solid #e2e8f0" };
const boldText = { fontWeight: "700", color: "#1e293b" };
const taxText = { fontWeight: "800", color: "#ef4444", fontSize: "18px" };
const disclaimer = { fontSize: "11px", color: "#94a3b8", marginTop: "20px", fontStyle: "italic" };

export default TaxEstimator;