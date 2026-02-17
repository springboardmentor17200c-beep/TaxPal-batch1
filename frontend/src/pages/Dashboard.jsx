
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("income");

  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "",
    date: new Date().toISOString().split('T')[0],
    notes: ""
  });

  const fetchTransactions = async () => {
    try {
      const res = await api.get("/transactions");
      setTransactions(res.data);
    } catch (err) { console.error("Fetch error:", err); }
  };

  useEffect(() => { fetchTransactions(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const transactionData = {
        ...formData,
        type: modalType,
        amount: parseFloat(formData.amount),
        // FIXED: Changed userId to firebaseId to match your MongoDB Schema
        firebaseId: user.uid 
      };

      await api.post("/transactions", transactionData);
      fetchTransactions(); // Refresh the list
      setIsModalOpen(false); // Close modal
      // Reset form
      setFormData({ 
        description: "", 
        amount: "", 
        category: "", 
        date: new Date().toISOString().split('T')[0], 
        notes: "" 
      });
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save transaction. Please check your network or server.");
    }
  };

  // --- ANALYTICS ---
  const totalIncome = transactions.filter(t => t.type === "income").reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === "expense").reduce((acc, curr) => acc + curr.amount, 0);
  const estimatedTax = (totalIncome * 0.20).toFixed(2);
  const savingsRate = totalIncome > 0 ? (((totalIncome - totalExpenses) / totalIncome) * 100).toFixed(1) : 0;

  // --- CHART DATA ---
  const barData = [{ name: 'Overview', Income: totalIncome, Expense: totalExpenses }];
  const expenseByCategory = transactions.filter(t => t.type === "expense").reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});
  const pieData = Object.keys(expenseByCategory).map(key => ({ name: key, value: expenseByCategory[key] }));
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div style={dashboardWrapper}>
      {/* HEADER SECTION */}
      <header style={headerStyle}>
        <div>
          <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#0f172a' }}>Financial Overview</h2>
          <p style={{ color: "#64748b", fontSize: "14px", marginTop: '4px' }}>Analyze your income, expenses, and tax liabilities.</p>
        </div>
        <div style={actionButtons}>
          <button onClick={() => { setModalType("income"); setIsModalOpen(true); }} style={incomeBtn}>+ Record Income</button>
          <button onClick={() => { setModalType("expense"); setIsModalOpen(true); }} style={expenseBtn}>- Record Expense</button>
        </div>
      </header>

      {/* STATS TILES */}
      <section style={statsGrid}>
        <div style={statCard}>
          <span style={statLabel}>↑ FROM LAST MONTH</span>
          <p style={statTitle}>Monthly Income</p>
          <h3 style={statValue}>₹{totalIncome.toLocaleString('en-IN')}</h3>
        </div>
        <div style={statCard}>
          <span style={{...statLabel, color: '#ef4444'}}>↓ FROM LAST MONTH</span>
          <p style={statTitle}>Monthly Expenses</p>
          <h3 style={statValue}>₹{totalExpenses.toLocaleString('en-IN')}</h3>
        </div>
        <div style={statCard}>
          <span style={{...statLabel, color: '#f59e0b'}}>ACTIVE QUARTER</span>
          <p style={statTitle}>Estimated Tax Due</p>
          <h3 style={statValue}>₹{estimatedTax}</h3>
        </div>
        <div style={statCard}>
          <span style={statLabel}>CURRENT STATUS</span>
          <p style={statTitle}>Savings Rate</p>
          <h3 style={statValue}>{savingsRate}%</h3>
        </div>
      </section>

      {/* CHARTS */}
      <section style={chartSection}>
        <div style={chartCard}>
          <div style={chartHeader}>
              <h4 style={chartTitle}>Income vs Expenses</h4>
              <div style={timeFilter}>
                  <button style={activeFilter}>Month</button>
                  <button style={filterBtn}>Quarter</button>
                  <button style={filterBtn}>Year</button>
              </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
              <Tooltip cursor={{fill: '#f8fafc'}} />
              <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
              <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
              <Bar dataKey="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div style={chartCard}>
          <h4 style={chartTitle}>Expense Breakdown</h4>
          <div style={{ display: 'flex', alignItems: 'center', height: '100%', minHeight: '280px' }}>
              <ResponsiveContainer width="60%" height={250}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" paddingAngle={5}>
                    {pieData.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div style={pieLegend}>
                  {pieData.map((entry, index) => (
                      <div key={index} style={legendItem}>
                          <span style={{...legendDot, background: COLORS[index % COLORS.length]}}></span>
                          <span style={legendText}>{entry.name}</span>
                      </div>
                  ))}
              </div>
          </div>
        </div>
      </section>

      {/* TRANSACTIONS TABLE */}
      <section style={{ ...chartCard, marginTop: '24px' }}>
        <div style={chartHeader}>
          <h4 style={chartTitle}>Recent Transactions</h4>
          <button style={viewAllBtn}>View All</button>
        </div>
        <table style={tableStyle}>
          <thead>
            <tr style={tableHeaderRow}>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Description</th>
              <th style={thStyle}>Category</th>
              <th style={thStyle}>Amount</th>
              <th style={thStyle}>Type</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length > 0 ? transactions.slice(0, 10).map(t => (
              <tr key={t._id} style={tableRow}>
                <td>{new Date(t.date).toLocaleDateString('en-IN')}</td>
                <td style={{fontWeight: '500'}}>{t.description}</td>
                <td style={{ color: '#64748b' }}>{t.category}</td>
                <td style={{ fontWeight: '600', color: '#0f172a' }}>₹{t.amount.toLocaleString('en-IN')}</td>
                <td><span style={t.type === 'income' ? typeIncome : typeExpense}>{t.type}</span></td>
              </tr>
            )) : (
              <tr><td colSpan="5" style={{textAlign: 'center', padding: '20px', color: '#94a3b8'}}>No transactions recorded.</td></tr>
            )}
          </tbody>
        </table>
      </section>

      {/* MODAL */}
      {isModalOpen && (
        <div style={modalOverlay}>
          <div style={modalCard}>
            <div style={{ padding: '0 0 10px 0' }}>
              <h3 style={modalMainTitle}>Record New {modalType === 'income' ? 'Income' : 'Expense'}</h3>
              <p style={modalSubtitle}>Add details about your {modalType} to track your finances better.</p>
            </div>
            <div style={modalInnerCard}>
              <div style={modalInnerHeader}>
                <span style={{ fontWeight: '600', fontSize: '15px' }}>Add {modalType.charAt(0).toUpperCase() + modalType.slice(1)}</span>
                <button onClick={() => setIsModalOpen(false)} style={closeBtnIcon}>&times;</button>
              </div>
              <form onSubmit={handleSave} style={modalForm}>
                <div style={formRow}>
                  <div style={inputGroup}>
                    <label style={labelStyle}>Description</label>
                    <input style={inputStyle} placeholder="e.g. Freelance project" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required />
                  </div>
                  <div style={inputGroup}>
                    <label style={labelStyle}>Amount</label>
                    <div style={amountWrapper}>
                      <span style={currencyPrefix}>₹</span>
                      <input type="number" style={amountInput} placeholder="0.00" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} required />
                    </div>
                  </div>
                </div>
                <div style={formRow}>
                  <div style={inputGroup}>
                    <label style={labelStyle}>Category</label>
                    <select style={inputStyle} value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} required>
                      <option value="">Select Category</option>
                      {modalType === 'income' ? (
                        <><option value="Salary">Salary</option><option value="Freelance">Freelance</option><option value="Investments">Investments</option></>
                      ) : (
                        <><option value="Rent">Rent</option><option value="Food">Food</option><option value="Utilities">Utilities</option><option value="Transport">Transport</option><option value="Other">Other</option></>
                      )}
                    </select>
                  </div>
                  <div style={inputGroup}>
                    <label style={labelStyle}>Date</label>
                    <input type="date" style={inputStyle} value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required />
                  </div>
                </div>
                <div style={inputGroup}>
                  <label style={labelStyle}>Notes (Optional)</label>
                  <textarea style={textareaStyle} placeholder="Add any additional details..." value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
                </div>
                <div style={modalFooter}>
                  <button type="button" onClick={() => setIsModalOpen(false)} style={cancelBtn}>Cancel</button>
                  <button type="submit" style={modalType === 'income' ? saveBtnBlue : saveBtnRed}>Save Transaction</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- STYLES ---
const dashboardWrapper = { width: "100%" };
const headerStyle = { display: "flex", justifyContent: "space-between", alignItems: 'center', marginBottom: "32px" };
const actionButtons = { display: "flex", gap: "12px" };
const incomeBtn = { padding: "12px 20px", borderRadius: "10px", border: "1px solid #e2e8f0", backgroundColor: "#fff", cursor: "pointer", fontSize: "14px", fontWeight: '600', color: '#1e293b' };
const expenseBtn = { ...incomeBtn, backgroundColor: '#0f172a', color: '#fff', border: 'none' };

const statsGrid = { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "32px" };
const statCard = { padding: "24px", backgroundColor: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" };
const statLabel = { fontSize: '10px', fontWeight: '800', color: '#10b981', display: 'block', marginBottom: '8px', letterSpacing: '0.05em' };
const statTitle = { margin: 0, fontSize: '14px', color: '#64748b', fontWeight: '500' };
const statValue = { margin: '6px 0 0 0', fontSize: '24px', fontWeight: '700', color: '#0f172a' };

const chartSection = { display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "24px" };
const chartCard = { backgroundColor: "#fff", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0" };
const chartHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' };
const chartTitle = { margin: 0, fontSize: "16px", fontWeight: '700', color: "#0f172a" };
const timeFilter = { display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '8px' };
const filterBtn = { padding: '6px 12px', fontSize: '12px', border: 'none', background: 'none', cursor: 'pointer', color: '#64748b', fontWeight: '500' };
const activeFilter = { ...filterBtn, background: '#fff', borderRadius: '6px', color: '#0f172a', fontWeight: '700', boxShadow: '0 1px 2px rgba(0,0,0,0.06)' };

const pieLegend = { display: 'flex', flexDirection: 'column', gap: '12px', marginLeft: '20px' };
const legendItem = { display: 'flex', alignItems: 'center', gap: '10px' };
const legendDot = { width: '8px', height: '8px', borderRadius: '50%' };
const legendText = { fontSize: '13px', color: '#64748b', fontWeight: '500' };
const viewAllBtn = { fontSize: '13px', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' };

const tableStyle = { width: "100%", borderCollapse: "collapse" };
const tableHeaderRow = { textAlign: "left" };
const thStyle = { paddingBottom: '16px', fontSize: "12px", color: "#94a3b8", fontWeight: "600", textTransform: 'uppercase' };
const tableRow = { fontSize: "14px", borderTop: "1px solid #f1f5f9", height: "56px" };
const typeIncome = { color: "#10b981", backgroundColor: '#f0fdf4', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '700' };
const typeExpense = { color: "#ef4444", backgroundColor: '#fef2f2', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '700' };

const modalOverlay = { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(15, 23, 42, 0.4)", backdropFilter: 'blur(4px)', display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 };
const modalCard = { background: "#fff", width: "520px", borderRadius: "16px", padding: "24px" };
const modalMainTitle = { margin: 0, fontSize: '18px', fontWeight: '700', color: '#0f172a' };
const modalSubtitle = { margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' };
const modalInnerCard = { border: '1px solid #e2e8f0', borderRadius: '12px', marginTop: '20px' };
const modalInnerHeader = { padding: '12px 16px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const closeBtnIcon = { border: 'none', background: 'none', cursor: 'pointer', fontSize: '20px', color: '#94a3b8' };
const modalForm = { padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' };
const formRow = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' };
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '6px' }; 
const labelStyle = { fontSize: '12px', fontWeight: '600', color: '#475569' };
const inputStyle = { padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' };
const amountWrapper = { position: 'relative', display: 'flex', alignItems: 'center' };
const currencyPrefix = { position: 'absolute', left: '10px', color: '#94a3b8', fontSize: '13px' };
const amountInput = { ...inputStyle, width: '100%', paddingLeft: '22px' };
const textareaStyle = { ...inputStyle, minHeight: '60px', resize: 'none' };
const modalFooter = { display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' };
const cancelBtn = { padding: '10px 16px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' };
const saveBtnBlue = { padding: '10px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' };
const saveBtnRed = { ...saveBtnBlue, background: '#ef4444' };

export default Dashboard;