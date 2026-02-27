

import React, { useState, useEffect } from "react";
import api from "../api/axios";

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbCategories, setDbCategories] = useState([]); 
  
  // FILTER STATES
  const [filterCriteria, setFilterCriteria] = useState({
    category: "",
    type: "expense",
    month: new Date().toISOString().slice(0, 7) // Default to current YYYY-MM
  });
  const [filteredResults, setFilteredResults] = useState([]);
  const [isFiltering, setIsFiltering] = useState(false);

  // RESPONSIVE STATE
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const isMobile = windowWidth < 768;

  // UPDATED: Added 'type' to formData
  const [formData, setFormData] = useState({
    category: "",
    type: "expense", 
    amount: "",
    month: new Date().toISOString().slice(0, 7),
    description: ""
  });

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    fetchData();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [budgetRes, categoryRes] = await Promise.all([
        api.get("/budgets"),
        api.get("/categories")
      ]);
      const sortedData = budgetRes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setBudgets(sortedData);
      setDbCategories(categoryRes.data);
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = async () => {
    setIsFiltering(true);
    try {
      const response = await api.get("/budgets/search", {
        params: {
          category: filterCriteria.category,
          type: filterCriteria.type,
          month: filterCriteria.month 
        }
      });
      setFilteredResults(response.data);
    } catch (err) {
      console.error("Filter failed", err);
      alert("No matching records found.");
    } finally {
      setIsFiltering(false);
    }
  };

  const handleCreateBudget = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/budgets", formData);
      setBudgets([response.data, ...budgets]);
      alert("Budget created successfully!");
      setFormData({ 
        category: "", 
        type: "expense",
        amount: "", 
        month: new Date().toISOString().slice(0, 7), 
        description: "" 
      }); 
      fetchData(); 
    } catch (err) {
      alert("Error creating budget.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this budget?")) {
      try {
        await api.delete(`/budgets/${id}`);
        setBudgets(budgets.filter(b => b._id !== id));
      } catch (err) {
        alert("Failed to delete budget.");
      }
    }
  };

  const totalBudgeted = budgets.reduce((acc, b) => acc + (Number(b.amount) || 0), 0);
  const totalSpent = budgets.reduce((acc, b) => acc + (Number(b.spent) || 0), 0);
  const healthStatus = totalSpent > totalBudgeted ? "At Risk" : "Good";

  return (
    <div style={{...container, padding: isMobile ? '12px' : '20px'}}>
      
      {/* HEADER SECTION */}
      <div style={{
        ...headerSection, 
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'flex-start' : 'center',
        gap: isMobile ? '16px' : '0'
      }}>
        <div>
          <h2 style={title}>Budget Management</h2>
          <p style={subtitle}>Filter, track, and manage your spending.</p>
        </div>
        <div style={{...healthCard, width: isMobile ? '100%' : 'auto'}}>
          <span style={healthLabel}>Health Status</span>
          <span style={{ ...healthStatusText, color: healthStatus === "Good" ? "#10b981" : "#ef4444" }}>
            {healthStatus}
          </span>
        </div>
      </div>

      {/* FILTER BAR SECTION */}
      <div style={filterCard}>
        <div style={cardHeader}><h3 style={cardTitle}>Search & Filter Records</h3></div>
        <div style={{...filterGrid, gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)'}}>
          <div style={inputGroup}>
            <label style={label}>Type</label>
            <select 
              style={input} 
              value={filterCriteria.type}
              onChange={(e) => setFilterCriteria({...filterCriteria, type: e.target.value})}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
          <div style={inputGroup}>
            <label style={label}>Category</label>
            <select 
              style={input} 
              value={filterCriteria.category}
              onChange={(e) => setFilterCriteria({...filterCriteria, category: e.target.value})}
            >
              <option value="">All Categories</option>
              {dbCategories.map(cat => (
                <option key={cat._id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div style={inputGroup}>
            <label style={label}>Month</label>
            <input 
              type="month" 
              style={input} 
              value={filterCriteria.month}
              onChange={(e) => setFilterCriteria({...filterCriteria, month: e.target.value})}
            />
          </div>
          <button onClick={handleApplyFilter} style={searchBtn}>
            {isFiltering ? "Searching..." : "Apply Filters"}
          </button>
        </div>

        {filteredResults.length > 0 && (
          <div style={resultsContainer}>
            <h4 style={{fontSize: '13px', color: '#64748b', marginBottom: '10px'}}>Search Results:</h4>
            {filteredResults.map(res => (
              <div key={res._id} style={resultItem}>
                <span>{res.category} ({new Date(res.month.$date || res.month).toLocaleDateString(undefined, {month: 'long', year: 'numeric'})})</span>
                <span style={{fontWeight: '700'}}>{formatINR(res.amount)}</span>
              </div>
            ))}
            <button style={clearBtn} onClick={() => setFilteredResults([])}>Clear Results</button>
          </div>
        )}
      </div>

      {/* CREATE BUDGET CARD */}
      <div style={card}>
        <div style={cardHeader}><h3 style={cardTitle}>Create New Budget</h3></div>
        <form onSubmit={handleCreateBudget} style={{...formGrid, gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr'}}>
          
          {/* NEW: Type Selection for Creation */}
          <div style={inputGroup}>
            <label style={label}>Type</label>
            <select 
              style={input} 
              value={formData.type} 
              required 
              onChange={(e) => setFormData({...formData, type: e.target.value, category: ""})}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>

          <div style={inputGroup}>
            <label style={label}>Category</label>
            <select 
              style={input} 
              value={formData.category} 
              required 
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              <option value="">Select a category</option>
              {dbCategories
                .filter(cat => cat.type === formData.type) // Filter categories by selected type
                .map(cat => (
                  <option key={cat._id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div style={inputGroup}>
            <label style={label}>Budget Amount</label>
            <div style={amountWrapper}>
              <span style={currencySymbol}>₹</span>
              <input type="number" style={amountInput} value={formData.amount} required onChange={(e) => setFormData({...formData, amount: e.target.value})} />
            </div>
          </div>

          <div style={inputGroup}>
            <label style={label}>Month</label>
            <input type="month" style={input} value={formData.month} required onChange={(e) => setFormData({...formData, month: e.target.value})} />
          </div>

          <div style={{...inputGroup, gridColumn: isMobile ? "span 1" : "span 2"}}>
            <label style={label}>Description</label>
            <textarea style={textarea} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
          </div>

          <div style={{...formActions, gridColumn: isMobile ? "span 1" : "span 2"}}>
            <button type="submit" style={submitBtn} disabled={loading}>{loading ? "Saving..." : "Create Budget"}</button>
          </div>
        </form>
      </div>

      {/* TABLE SECTION */}
      <div style={{...tableWrapper, overflowX: 'auto'}}>
        <div style={{padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between'}}>
           <h4 style={{margin: 0, fontSize: '14px', color: '#475569'}}>Recent Budgets</h4>
           <button onClick={fetchData} style={{background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer'}}>Refresh</button>
        </div>
        <div style={{ minWidth: isMobile ? '700px' : '100%' }}>
          <table style={table}>
            <thead>
              <tr style={thRow}>
                <th style={th}>Category</th>
                <th style={th}>Type</th>
                <th style={th}>Budget</th>
                <th style={th}>Spent</th>
                <th style={th}>Remaining</th>
                <th style={th}>Progress</th>
                <th style={th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {budgets.map((b) => {
                const spent = Number(b.spent) || 0;
                const limit = Number(b.amount) || 0;
                const progress = Math.min((spent / limit) * 100, 100);
                const displayMonth = b.month.$date ? new Date(b.month.$date).toLocaleDateString(undefined, {month: 'short', year: 'numeric'}) : b.month;

                return (
                  <tr key={b._id} style={tr}>
                    <td style={td}>
                      <div style={{fontWeight: '600'}}>{b.category}</div>
                      <div style={{fontSize: '11px', color: '#94a3b8'}}>{displayMonth}</div>
                    </td>
                    <td style={{...td, textTransform: 'capitalize', color: b.type === 'income' ? '#10b981' : '#64748b'}}>
                      {b.type || 'expense'}
                    </td>
                    <td style={td}>{formatINR(limit)}</td>
                    <td style={{...td, color: spent > limit ? "#ef4444" : "#1e293b"}}>{formatINR(spent)}</td>
                    <td style={td}>{formatINR(limit - spent)}</td>
                    <td style={td}>
                      <div style={progressBarBg}>
                        <div style={{ ...progressBarFill, width: `${progress}%`, backgroundColor: progress > 90 ? "#ef4444" : "#3b82f6" }} />
                      </div>
                    </td>
                    <td style={td}>
                      <button onClick={() => handleDelete(b._id)} style={{color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer'}}>Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- STYLES ---
const container = { display: "flex", flexDirection: "column", gap: "24px" };
const headerSection = { display: "flex", justifyContent: "space-between" };
const title = { margin: 0, fontSize: "24px", fontWeight: "700", color: "#1e293b" };
const subtitle = { margin: "4px 0 0 0", color: "#64748b", fontSize: "14px" };
const healthCard = { background: "#fff", padding: "12px 24px", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "12px" };
const healthLabel = { fontSize: "14px", color: "#64748b" };
const healthStatusText = { fontWeight: "700" };
const card = { background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "24px" };
const filterCard = { ...card, border: "2px solid #3b82f6", background: "#f0f7ff" };
const cardHeader = { marginBottom: "16px" };
const cardTitle = { margin: 0, fontSize: "16px", fontWeight: "600", color: "#1e293b" };
const filterGrid = { display: "grid", gap: "12px", alignItems: "flex-end" };
const formGrid = { display: "grid", gap: "20px" };
const inputGroup = { display: "flex", flexDirection: "column", gap: "6px" };
const label = { fontSize: "12px", fontWeight: "600", color: "#475569" };
const input = { padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "14px", width: "100%", boxSizing: "border-box" };
const textarea = { ...input, minHeight: "60px", resize: "none" };
const searchBtn = { padding: "11px", borderRadius: "8px", background: "#3b82f6", color: "#fff", border: "none", cursor: "pointer", fontWeight: "600" };
const resultsContainer = { marginTop: "20px", padding: "15px", background: "#fff", borderRadius: "8px", border: "1px solid #bfdbfe" };
const resultItem = { display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9", fontSize: "14px" };
const clearBtn = { marginTop: "10px", background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "12px" };
const amountWrapper = { position: "relative" };
const currencySymbol = { position: "absolute", left: "10px", top: "10px", color: "#94a3b8" };
const amountInput = { ...input, paddingLeft: "25px" };
const formActions = { display: "flex", justifyContent: "flex-end" };
const submitBtn = { padding: "10px 20px", borderRadius: "8px", background: "#0f172a", color: "#fff", border: "none", cursor: "pointer", fontWeight: "600" };
const tableWrapper = { background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0" };
const table = { width: "100%", borderCollapse: "collapse", textAlign: "left" };
const thRow = { background: "#f8fafc" };
const th = { padding: "14px 20px", fontSize: "11px", color: "#64748b", textTransform: "uppercase" };
const tr = { borderBottom: "1px solid #f1f5f9" };
const td = { padding: "16px 20px", fontSize: "14px" };
const progressBarBg = { width: "100px", height: "8px", background: "#f1f5f9", borderRadius: "10px", overflow: "hidden" };
const progressBarFill = { height: "100%", transition: "width 0.3s ease" };

export default Budgets;