

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
  const [breakdownData, setBreakdownData] = useState([]);
  const [dbCategories, setDbCategories] = useState([]); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("income");

  // RESPONSIVE STATES
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth < 1024;

  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "",
    date: new Date().toISOString().split('T')[0],
    notes: ""
  });

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    fetchDashboardData();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [resTrans, resBreakdown, resCats] = await Promise.all([
        api.get("/transactions"),
        api.get("/transactions/breakdown"),
        api.get("/categories")
      ]);
      setTransactions(resTrans.data);
      setBreakdownData(resBreakdown.data);
      setDbCategories(resCats.data);
    } catch (err) { 
      console.error("Fetch error:", err); 
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const transactionData = {
        ...formData,
        type: modalType,
        amount: parseFloat(formData.amount),
        firebaseId: user.uid 
      };

      await api.post("/transactions", transactionData);
      fetchDashboardData(); 
      setIsModalOpen(false); 
      setFormData({ 
        description: "", amount: "", category: "", 
        date: new Date().toISOString().split('T')[0], notes: "" 
      });
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save transaction.");
    }
  };

  const totalIncome = transactions.filter(t => t.type === "income").reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === "expense").reduce((acc, curr) => acc + curr.amount, 0);
  const estimatedTax = (totalIncome * 0.20).toFixed(2);
  const savingsRate = totalIncome > 0 ? (((totalIncome - totalExpenses) / totalIncome) * 100).toFixed(1) : 0;

  const barData = [{ name: 'Overview', Income: totalIncome, Expense: totalExpenses }];
  
  // Custom Colors matching the provided image style
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

  return (
    <div style={{...dashboardWrapper, padding: isMobile ? '10px' : '20px'}}>

      <header style={{
        ...headerStyle, 
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'flex-start' : 'center',
        gap: isMobile ? '20px' : '0'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: isMobile ? '22px' : '28px', fontWeight: '700', color: '#0f172a' }}>Financial Overview</h2>
          <p style={{ color: "#64748b", fontSize: "14px", marginTop: '4px' }}>Analyze your income and expenses.</p>
        </div>
        <div style={{...actionButtons, width: isMobile ? '100%' : 'auto'}}>
          <button onClick={() => { setModalType("income"); setIsModalOpen(true); }} style={{...incomeBtn, flex: isMobile ? 1 : 'none'}}>+ Income</button>
          <button onClick={() => { setModalType("expense"); setIsModalOpen(true); }} style={{...expenseBtn, flex: isMobile ? 1 : 'none'}}>- Expense</button>
        </div>
      </header>

      <section style={{
        ...statsGrid, 
        gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(4, 1fr)'
      }}>
        <div style={statCard}>
          <span style={statLabel}>↑ INCOME</span>
          <h3 style={statValue}>₹{totalIncome.toLocaleString('en-IN')}</h3>
        </div>
        <div style={statCard}>
          <span style={{...statLabel, color: '#ef4444'}}>↓ EXPENSES</span>
          <h3 style={statValue}>₹{totalExpenses.toLocaleString('en-IN')}</h3>
        </div>
        <div style={statCard}>
          <span style={{...statLabel, color: '#f59e0b'}}>TAX DUE</span>
          <h3 style={statValue}>₹{estimatedTax}</h3>
        </div>
        <div style={statCard}>
          <span style={statLabel}>SAVINGS</span>
          <h3 style={statValue}>{savingsRate}%</h3>
        </div>
      </section>

      <section style={{
        ...chartSection, 
        gridTemplateColumns: isTablet ? '1fr' : '1.6fr 1fr'
      }}>
        {/* BAR CHART */}
        <div style={chartCard}>
          <h4 style={chartTitle}>Income vs Expenses</h4>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <Tooltip cursor={{fill: '#f8fafc'}} />
              <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={isMobile ? 30 : 40} />
              <Bar dataKey="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={isMobile ? 30 : 40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* UPDATED PIE CHART & LEGEND (To match your image) */}
        <div style={chartCard}>
          <h4 style={chartTitle}>Expense Breakdown</h4>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: '10px'
          }}>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie 
                    data={breakdownData} 
                    innerRadius={0} // Filled pie like the image
                    outerRadius={90} 
                    paddingAngle={2}
                    dataKey="amount"
                    stroke="none"
                  >
                    {breakdownData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              {/* LIST LEGEND SECTION - Matching image layout */}
              <div style={{ width: '100%', marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {breakdownData.map((entry, index) => (
                      <div key={index} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        padding: '4px 0' 
                      }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ 
                                width: '10px', 
                                height: '10px', 
                                borderRadius: '50%', 
                                background: COLORS[index % COLORS.length] 
                              }}></div>
                              <span style={{ fontSize: '14px', color: '#475569', fontWeight: '500' }}>
                                {entry.category}
                              </span>
                          </div>
                          <span style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>
                            {entry.percentage.toFixed(0)}%
                          </span>
                      </div>
                  ))}
              </div>
          </div>
        </div>
      </section>

      <section style={{ ...chartCard, marginTop: '24px', overflowX: 'auto' }}>
        <h4 style={chartTitle}>Recent Transactions</h4>
        <div style={{ minWidth: isMobile ? '600px' : 'auto' }}>
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
                <tr><td colSpan="5" style={{textAlign: 'center', padding: '20px', color: '#94a3b8'}}>No data.</td></tr>
                )}
            </tbody>
            </table>
        </div>
      </section>

      {isModalOpen && (
        <div style={modalOverlay}>
          <div style={{
            ...modalCard, 
            width: isMobile ? '90%' : '520px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div>
              <h3 style={modalMainTitle}>Record New {modalType}</h3>
              <p style={modalSubtitle}>Add details below.</p>
            </div>
            <div style={modalInnerCard}>
              <div style={modalInnerHeader}>
                <span style={{ fontWeight: '600' }}>Add {modalType}</span>
                <button onClick={() => setIsModalOpen(false)} style={closeBtnIcon}>&times;</button>
              </div>
              <form onSubmit={handleSave} style={modalForm}>
                <div style={{...formRow, gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr'}}>
                  <div style={inputGroup}>
                    <label style={labelStyle}>Description</label>
                    <input style={inputStyle} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required />
                  </div>
                  <div style={inputGroup}>
                    <label style={labelStyle}>Amount</label>
                    <div style={amountWrapper}>
                      <span style={currencyPrefix}>₹</span>
                      <input type="number" style={amountInput} value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} required />
                    </div>
                  </div>
                </div>
                <div style={{...formRow, gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr'}}>
                  <div style={inputGroup}>
                    <label style={labelStyle}>Category</label>
                    <select style={inputStyle} value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} required>
                      <option value="">Select Category</option>
                      {dbCategories.filter(cat => cat.type === modalType).map(cat => (
                        <option key={cat._id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div style={inputGroup}>
                    <label style={labelStyle}>Date</label>
                    <input type="date" style={inputStyle} value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required />
                  </div>
                </div>
                <div style={inputGroup}>
                  <label style={labelStyle}>Notes</label>
                  <textarea style={textareaStyle} value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
                </div>
                <div style={modalFooter}>
                  <button type="button" onClick={() => setIsModalOpen(false)} style={cancelBtn}>Cancel</button>
                  <button type="submit" style={modalType === 'income' ? saveBtnBlue : saveBtnRed}>Save</button>
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
const dashboardWrapper = { width: "100%", boxSizing: 'border-box', minHeight: '100vh', backgroundColor: '#f8fafc' };
const headerStyle = { display: "flex", justifyContent: "space-between", marginBottom: "32px" };
const actionButtons = { display: "flex", gap: "12px" };
const incomeBtn = { padding: "12px 20px", borderRadius: "10px", border: "1px solid #e2e8f0", backgroundColor: "#fff", cursor: "pointer", fontSize: "14px", fontWeight: '600', color: '#1e293b' };
const expenseBtn = { ...incomeBtn, backgroundColor: '#0f172a', color: '#fff', border: 'none' };
const statsGrid = { display: "grid", gap: "20px", marginBottom: "32px" };
const statCard = { padding: "24px", backgroundColor: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0" };
const statLabel = { fontSize: '10px', fontWeight: '800', color: '#10b981', display: 'block', marginBottom: '8px', letterSpacing: '0.05em' };
const statValue = { margin: '6px 0 0 0', fontSize: '24px', fontWeight: '700', color: '#0f172a' };
const chartSection = { display: "grid", gap: "24px" };
const chartCard = { backgroundColor: "#fff", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0" };
const chartTitle = { margin: "0 0 16px 0", fontSize: "16px", fontWeight: '700', color: "#0f172a" };
const tableStyle = { width: "100%", borderCollapse: "collapse" };
const tableHeaderRow = { textAlign: "left" };
const thStyle = { paddingBottom: '16px', fontSize: "12px", color: "#94a3b8", fontWeight: "600", textTransform: 'uppercase' };
const tableRow = { fontSize: "14px", borderTop: "1px solid #f1f5f9", height: "56px" };
const typeIncome = { color: "#10b981", backgroundColor: '#f0fdf4', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '700' };
const typeExpense = { color: "#ef4444", backgroundColor: '#fef2f2', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '700' };
const modalOverlay = { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(15, 23, 42, 0.4)", backdropFilter: 'blur(4px)', display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 };
const modalCard = { background: "#fff", borderRadius: "16px", padding: "24px" };
const modalMainTitle = { margin: 0, fontSize: '18px', fontWeight: '700', color: '#0f172a' };
const modalSubtitle = { margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' };
const modalInnerCard = { border: '1px solid #e2e8f0', borderRadius: '12px', marginTop: '20px' };
const modalInnerHeader = { padding: '12px 16px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const closeBtnIcon = { border: 'none', background: 'none', cursor: 'pointer', fontSize: '20px', color: '#94a3b8' };
const modalForm = { padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' };
const formRow = { display: 'grid', gap: '16px' };
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