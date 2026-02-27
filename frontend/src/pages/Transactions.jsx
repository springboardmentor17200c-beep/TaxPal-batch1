

import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Transactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // RESPONSIVE STATE
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const isMobile = windowWidth < 768;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    fetchTransactions();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await api.get("/transactions");
      setTransactions(res.data);
    } catch (err) {
      console.error("Error fetching transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this transaction permanently?")) {
      try {
        await api.delete(`/transactions/${id}`);
        setTransactions(transactions.filter((t) => t._id !== id));
      } catch (err) {
        alert("Failed to delete");
      }
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchesFilter = filter === "all" || t.type === filter;
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const incomeTotal = filteredTransactions.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0);
  const expenseTotal = filteredTransactions.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0);

  return (
    <div style={{...pageContent, padding: isMobile ? '10px' : '20px'}}>
     
      <header style={{
        ...headerStyle, 
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'flex-start' : 'center',
        gap: isMobile ? '20px' : '0'
      }}>
        <div>
          <h2 style={titleStyle}>Transactions</h2>
          <p style={subtitleStyle}>You have {filteredTransactions.length} records.</p>
        </div>
        
        <div style={{
          ...controlsStyle, 
          flexDirection: isMobile ? 'column' : 'row',
          width: isMobile ? '100%' : 'auto',
          alignItems: 'stretch'
        }}>
          <input 
            type="text" 
            placeholder="Search..." 
            style={{...searchInput, width: isMobile ? '100%' : '240px'}}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div style={{...filterButtonGroup, justifyContent: 'center'}}>
            <button onClick={() => setFilter("all")} style={filter === "all" ? activeTab : inactiveTab}>All</button>
            <button onClick={() => setFilter("income")} style={filter === "income" ? activeTab : inactiveTab}>In</button>
            <button onClick={() => setFilter("expense")} style={filter === "expense" ? activeTab : inactiveTab}>Out</button>
          </div>
        </div>
      </header>


      <div style={{
        ...summaryBar, 
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '16px' : '40px',
        alignItems: isMobile ? 'flex-start' : 'center'
      }}>
        <div style={summaryItem}>
          <span style={summaryLabel}>Income</span>
          <span style={{...summaryValue, color: '#10b981'}}>+ ₹{incomeTotal.toLocaleString()}</span>
        </div>
        {!isMobile && <div style={summaryDivider}></div>}
        <div style={summaryItem}>
          <span style={summaryLabel}>Expenses</span>
          <span style={{...summaryValue, color: '#ef4444'}}>- ₹{expenseTotal.toLocaleString()}</span>
        </div>
        {!isMobile && <div style={summaryDivider}></div>}
        <div style={summaryItem}>
          <span style={summaryLabel}>Net Flow</span>
          <span style={summaryValue}>₹{(incomeTotal - expenseTotal).toLocaleString()}</span>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div style={{...tableCard, overflowX: 'auto'}}>
        {loading ? (
          <div style={loaderBox}>Fetching data...</div>
        ) : (
          <div style={{ minWidth: isMobile ? '700px' : 'auto' }}>
            <table style={tableStyle}>
                <thead>
                <tr style={theadRow}>
                    <th style={thStyle}>Date</th>
                    <th style={thStyle}>Description</th>
                    <th style={thStyle}>Category</th>
                    <th style={thStyle}>Amount</th>
                    <th style={thStyle}>Status</th>
                    <th style={{...thStyle, textAlign: 'right'}}>Action</th>
                </tr>
                </thead>
                <tbody>
                {filteredTransactions.map((t) => (
                    <tr key={t._id} style={trStyle}>
                    <td style={tdStyle}>{new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</td>
                    <td style={{...tdStyle, fontWeight: '600', color: '#0f172a'}}>{t.description}</td>
                    <td style={tdStyle}><span style={badgeStyle}>{t.category}</span></td>
                    <td style={{...tdStyle, fontWeight: '700'}}>
                        {t.type === 'income' ? '+' : '-'} ₹{t.amount.toLocaleString()}
                    </td>
                    <td style={tdStyle}>
                        <div style={t.type === 'income' ? dotIncome : dotExpense}>
                        {t.type.charAt(0).toUpperCase() + t.type.slice(1)}
                        </div>
                    </td>
                    <td style={{...tdStyle, textAlign: 'right'}}>
                        <button onClick={() => handleDelete(t._id)} style={deleteAction}>Delete</button>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
          </div>
        )}
        
        {!loading && filteredTransactions.length === 0 && (
          <div style={emptyBox}>
            <p>No transactions found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- STYLES ---
const pageContent = { animation: "fadeIn 0.5s ease" };
const headerStyle = { display: "flex", justifyContent: "space-between", marginBottom: "24px" };
const titleStyle = { margin: 0, fontSize: "28px", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.5px" };
const subtitleStyle = { margin: "4px 0 0 0", fontSize: "14px", color: "#64748b" };
const controlsStyle = { display: "flex", gap: "12px" };
const searchInput = { padding: "10px 16px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "14px", outline: "none" };
const filterButtonGroup = { display: "flex", background: "#f1f5f9", padding: "4px", borderRadius: "10px" };
const inactiveTab = { padding: "6px 16px", border: "none", background: "none", cursor: "pointer", fontSize: "13px", fontWeight: "600", color: "#64748b" };
const activeTab = { ...inactiveTab, background: "#fff", color: "#0f172a", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" };
const summaryBar = { display: "flex", background: "#fff", padding: "20px", borderRadius: "16px", border: "1px solid #e2e8f0", marginBottom: "24px" };
const summaryItem = { display: "flex", flexDirection: "column", gap: "4px" };
const summaryLabel = { fontSize: "12px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase" };
const summaryValue = { fontSize: "18px", fontWeight: "700", color: "#1e293b" };
const summaryDivider = { width: "1px", height: "30px", background: "#f1f5f9" };
const tableCard = { background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" };
const tableStyle = { width: "100%", borderCollapse: "collapse" };
const theadRow = { background: "#f8fafc", borderBottom: "1px solid #e2e8f0" };
const thStyle = { padding: "16px 24px", fontSize: "12px", fontWeight: "600", color: "#64748b", textTransform: "uppercase" };
const trStyle = { borderBottom: "1px solid #f1f5f9" };
const tdStyle = { padding: "16px 24px", fontSize: "14px", color: "#475569" };
const badgeStyle = { padding: "4px 10px", background: "#f1f5f9", borderRadius: "6px", fontSize: "12px", color: "#475569", fontWeight: "500" };
const dotIncome = { display: "flex", alignItems: "center", gap: "6px", color: "#10b981", fontWeight: "600", fontSize: "13px" };
const dotExpense = { ...dotIncome, color: "#ef4444" };
const deleteAction = { background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "13px", fontWeight: "600" };
const loaderBox = { padding: "60px", textAlign: "center", color: "#64748b" };
const emptyBox = { padding: "60px", textAlign: "center", color: "#94a3b8" };

export default Transactions;