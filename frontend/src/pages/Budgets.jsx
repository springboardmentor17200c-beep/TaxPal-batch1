import React, { useState, useEffect } from "react";
import api from "../api/axios";

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    category: "",
    amount: "",
    month: "2026-02", 
    description: ""
  });

 
  const categories = ["Business Expenses", "Office Rent", "Software Subscriptions", "Travel", "Utilities"];

  const handleCreateBudget = async (e) => {
    e.preventDefault();
    
    console.log("Budget Created:", formData);
    setShowForm(false);
  };

  return (
    <div style={container}>
      {/* 1. Header & Budget Health */}
      <div style={headerSection}>
        <div>
          <h2 style={title}>Budgets</h2>
          <p style={subtitle}>Plan and manage your monthly spending limits.</p>
        </div>
        <div style={healthCard}>
          <span style={healthLabel}>Budget Health</span>
          <span style={healthStatus}>Good</span>
        </div>
      </div>

      {/* 2. Create New Budget Card (The Form) */}
      <div style={card}>
        <div style={cardHeader}>
          <h3 style={cardTitle}>Create New Budget</h3>
          <button style={closeBtn}>×</button>
        </div>
        
        <form onSubmit={handleCreateBudget} style={formGrid}>
          <div style={inputGroup}>
            <label style={label}>Category</label>
            <select 
              style={input} 
              value={formData.category} 
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              <option>Select a category</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div style={inputGroup}>
            <label style={label}>Budget Amount</label>
            <div style={amountWrapper}>
              <span style={currencySymbol}>$</span>
              <input 
                type="number" 
                placeholder="0.00" 
                style={amountInput}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
              />
            </div>
          </div>

          <div style={inputGroup}>
            <label style={label}>Month</label>
            <input 
              type="month" 
              style={input} 
              value={formData.month}
              onChange={(e) => setFormData({...formData, month: e.target.value})}
            />
          </div>

          <div style={{...inputGroup, gridColumn: "span 2"}}>
            <label style={label}>Description (Optional)</label>
            <textarea 
              placeholder="Add any additional details..." 
              style={textarea}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            ></textarea>
          </div>

          <div style={formActions}>
            <button type="button" style={cancelBtn}>Cancel</button>
            <button type="submit" style={submitBtn}>Create Budget</button>
          </div>
        </form>
      </div>

      {/* 3. Budget List Table */}
      <div style={tableWrapper}>
        <table style={table}>
          <thead>
            <tr style={thRow}>
              <th style={th}>Category</th>
              <th style={th}>Budget</th>
              <th style={th}>Spent</th>
              <th style={th}>Remaining</th>
              <th style={th}>Status</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Example Row */}
            <tr style={tr}>
              <td style={td}>Business Expenses</td>
              <td style={td}>$ 5,000.00</td>
              <td style={td}>$ 1,200.00</td>
              <td style={td}>$ 3,800.00</td>
              <td style={td}><span style={statusBadge}>On Track</span></td>
              <td style={td}><button style={editBtn}>✎</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- STYLES ---
const container = { display: "flex", flexDirection: "column", gap: "24px" };
const headerSection = { display: "flex", justifyContent: "space-between", alignItems: "center" };
const title = { margin: 0, fontSize: "24px", fontWeight: "700", color: "#1e293b" };
const subtitle = { margin: "4px 0 0 0", color: "#64748b", fontSize: "14px" };

const healthCard = { background: "#fff", padding: "12px 24px", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "16px" };
const healthLabel = { fontSize: "14px", color: "#64748b" };
const healthStatus = { fontWeight: "700", color: "#10b981" };

const card = { background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "24px" };
const cardHeader = { display: "flex", justifyContent: "space-between", marginBottom: "20px" };
const cardTitle = { margin: 0, fontSize: "16px", fontWeight: "600" };
const closeBtn = { border: "none", background: "none", fontSize: "20px", color: "#94a3b8", cursor: "pointer" };

const formGrid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" };
const inputGroup = { display: "flex", flexDirection: "column", gap: "8px" };
const label = { fontSize: "13px", fontWeight: "600", color: "#475569" };
const input = { padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "14px" };
const textarea = { ...input, minHeight: "80px", resize: "none" };

const amountWrapper = { position: "relative" };
const currencySymbol = { position: "absolute", left: "12px", top: "10px", color: "#94a3b8" };
const amountInput = { ...input, width: "100%", paddingLeft: "25px" };

const formActions = { gridColumn: "span 2", display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "10px" };
const cancelBtn = { padding: "10px 20px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontWeight: "600" };
const submitBtn = { ...cancelBtn, background: "#3b82f6", color: "#fff", border: "none" };

const tableWrapper = { background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" };
const table = { width: "100%", borderCollapse: "collapse", textAlign: "left" };
const thRow = { background: "#f8fafc", borderBottom: "1px solid #e2e8f0" };
const th = { padding: "12px 20px", fontSize: "12px", fontWeight: "600", color: "#64748b", textTransform: "uppercase" };
const tr = { borderBottom: "1px solid #f1f5f9" };
const td = { padding: "16px 20px", fontSize: "14px", color: "#1e293b" };
const statusBadge = { background: "#ecfdf5", color: "#10b981", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" };
const editBtn = { background: "none", border: "none", cursor: "pointer", color: "#94a3b8" };

export default Budgets;