import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { auth } from "../firebase/config"; 
import { signOut } from "firebase/auth";
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

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) { console.error("Logout failed", err); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const transactionData = {
        ...formData,
        type: modalType,
        amount: parseFloat(formData.amount),
        userId: user.uid 
      };

      await api.post("/transactions", transactionData);
      fetchTransactions();
      setIsModalOpen(false);
      setFormData({ description: "", amount: "", category: "", date: new Date().toISOString().split('T')[0], notes: "" });
    } catch (err) {
      alert("Failed to save transaction.");
    }
  };

  // --- ANALYTICS ---
  const totalIncome = transactions.filter(t => t.type === "income").reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === "expense").reduce((acc, curr) => acc + curr.amount, 0);
  const estimatedTax = (totalIncome * 0.20).toFixed(2);
  const savingsRate = totalIncome > 0 ? (((totalIncome - totalExpenses) / totalIncome) * 100).toFixed(1) : 0;

  // --- CHART DATA ---
  const barData = [{ name: 'Total', Income: totalIncome, Expense: totalExpenses }];
  const expenseByCategory = transactions.filter(t => t.type === "expense").reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});
  const pieData = Object.keys(expenseByCategory).map(key => ({ name: key, value: expenseByCategory[key] }));
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div style={dashboardContainer}>
      {/* SIDEBAR */}
      <aside style={sidebarStyle}>
        <div style={{ flex: 1 }}>
          <div style={logoStyle}>TaxPal</div>
          <nav style={navStyle}>
            <div style={activeNavItem}>Dashboard</div>
            <div style={navItem}>Transactions</div>
            <div style={navItem}>Budgets</div>
            <div style={navItem}>Tax Estimator</div>
          </nav>
        </div>

        <div style={profileSection}>
          <div style={userInfo}>
            <div style={avatar}>{user?.email ? user.email[0].toUpperCase() : "U"}</div>
            <div style={userMeta}>
              <span style={userName}>User</span>
              <span style={userEmail}>{user?.email}</span>
            </div>
          </div>
          <button onClick={handleLogout} style={logoutBtn}>Log out</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main style={mainContent}>
        <header style={headerStyle}>
          <div>
            <h2 style={{ margin: 0 }}>Financial Overview</h2>
            <p style={{ color: "#666", fontSize: "14px" }}>Welcome back, {user?.email}</p>
          </div>
          <div style={actionButtons}>
            <button onClick={() => { setModalType("income"); setIsModalOpen(true); }} style={incomeBtn}>+ Record Income</button>
            <button onClick={() => { setModalType("expense"); setIsModalOpen(true); }} style={expenseBtn}>- Record Expense</button>
          </div>
        </header>

        {/* STATS TILES */}
        <section style={statsGrid}>
          <div style={statCard}><span>Monthly Income</span><h3>₹{totalIncome}</h3></div>
          <div style={statCard}><span>Monthly Expenses</span><h3>₹{totalExpenses}</h3></div>
          <div style={statCard}><span>Estimated Tax Due</span><h3>₹{estimatedTax}</h3></div>
          <div style={statCard}><span>Savings Rate</span><h3>{savingsRate}%</h3></div>
        </section>

        {/* CHARTS */}
        <section style={chartSection}>
          <div style={chartCard}>
            <h4 style={chartTitle}>Income vs Expenses</h4>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f5f5f5'}} />
                <Legend iconType="circle" />
                <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                <Bar dataKey="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={chartCard}>
            <h4 style={chartTitle}>Expense Breakdown</h4>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" paddingAngle={5}>
                  {pieData.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* TRANSACTIONS TABLE */}
        <section style={{ ...chartCard, marginTop: '20px' }}>
          <h4 style={chartTitle}>Recent Transactions</h4>
          <table style={tableStyle}>
            <thead>
              <tr style={tableHeaderRow}>
                <th>Date</th><th>Description</th><th>Category</th><th>Amount</th><th>Type</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 10).map(t => (
                <tr key={t._id} style={tableRow}>
                  <td>{new Date(t.date).toLocaleDateString()}</td>
                  <td>{t.description}</td>
                  <td>{t.category}</td>
                  <td style={{ fontWeight: '600' }}>₹{t.amount}</td>
                  <td><span style={t.type === 'income' ? typeIncome : typeExpense}>{t.type}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* --- DYNAMIC MODAL (Updated to match screenshots) --- */}
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
                      <input 
                        style={inputStyle} placeholder="e.g. Web Design Project" 
                        value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required 
                      />
                    </div>
                    <div style={inputGroup}>
                      <label style={labelStyle}>Amount</label>
                      <div style={amountWrapper}>
                        <span style={currencyPrefix}>₹</span>
                        <input 
                          type="number" style={amountInput} placeholder="0.00" 
                          value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} required 
                        />
                      </div>
                    </div>
                  </div>

                  <div style={formRow}>
                    <div style={inputGroup}>
                      <label style={labelStyle}>Category</label>
                      <select 
                        style={inputStyle} value={formData.category} 
                        onChange={(e) => setFormData({...formData, category: e.target.value})} required
                      >
                        <option value="">Select Category</option>
                        {modalType === 'income' ? (
                          <>
                            <option value="Salary">Salary</option>
                            <option value="Freelance">Freelance</option>
                            <option value="Consulting">Consulting</option>
                          </>
                        ) : (
                          <>
                            <option value="Rent">Rent</option>
                            <option value="Food">Food</option>
                            <option value="Utilities">Utilities</option>
                            <option value="Business Expenses">Business Expenses</option>
                          </>
                        )}
                      </select>
                    </div>
                    <div style={inputGroup}>
                      <label style={labelStyle}>Date</label>
                      <input 
                        type="date" style={inputStyle} 
                        value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required 
                      />
                    </div>
                  </div>

                  <div style={inputGroup}>
                    <label style={labelStyle}>Notes (Optional)</label>
                    <textarea 
                      style={textareaStyle} placeholder="Add any additional details..."
                      value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    />
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
      </main>
    </div>
  );
};

// --- STYLES ---
const dashboardContainer = { display: "flex", height: "100vh", backgroundColor: "#f9fafb" };
const sidebarStyle = { width: "260px", backgroundColor: "#fff", borderRight: "1px solid #e5e7eb", padding: "24px", display: "flex", flexDirection: "column" };
const logoStyle = { fontSize: "24px", fontWeight: "bold", color: "#2563eb", marginBottom: "40px" };
const navStyle = { display: "flex", flexDirection: "column", gap: "8px" };
const navItem = { padding: "12px", borderRadius: "8px", color: "#4b5563", cursor: "pointer", fontSize: "14px" };
const activeNavItem = { ...navItem, backgroundColor: "#eff6ff", color: "#2563eb", fontWeight: "600" };
const profileSection = { borderTop: "1px solid #eee", paddingTop: "20px", marginTop: "20px" };
const userInfo = { display: "flex", alignItems: "center", gap: "12px", marginBottom: "15px" };
const avatar = { width: "35px", height: "35px", borderRadius: "50%", backgroundColor: "#3b82f6", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" };
const userMeta = { display: "flex", flexDirection: "column", overflow: "hidden" };
const userName = { fontSize: "14px", fontWeight: "600" };
const userEmail = { fontSize: "12px", color: "#666" };
const logoutBtn = { width: "100%", padding: "10px", background: "#fef2f2", color: "#dc2626", border: "1px solid #fee2e2", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600" };

const mainContent = { flex: 1, padding: "40px", overflowY: "auto" };
const headerStyle = { display: "flex", justifyContent: "space-between", marginBottom: "32px" };
const actionButtons = { display: "flex", gap: "12px" };
const incomeBtn = { padding: "10px 20px", borderRadius: "8px", border: "1px solid #d1d5db", backgroundColor: "#fff", cursor: "pointer", fontSize: "14px" };
const expenseBtn = { ...incomeBtn };

const statsGrid = { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "32px" };
const statCard = { padding: "24px", backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb" };

const chartSection = { display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "20px" };
const chartCard = { backgroundColor: "#fff", padding: "24px", borderRadius: "12px", border: "1px solid #e5e7eb" };
const chartTitle = { margin: "0 0 20px 0", fontSize: "16px", color: "#111" };

const tableStyle = { width: "100%", borderCollapse: "collapse" };
const tableHeaderRow = { textAlign: "left", fontSize: "13px", color: "#666", borderBottom: "1px solid #eee" };
const tableRow = { fontSize: "14px", borderBottom: "1px solid #f9f9f9", height: "45px" };
const typeIncome = { padding: "4px 8px", background: "#ecfdf5", color: "#059669", borderRadius: "6px", fontSize: "12px" };
const typeExpense = { padding: "4px 8px", background: "#fef2f2", color: "#dc2626", borderRadius: "6px", fontSize: "12px" };

// Updated Modal Styles
const modalOverlay = { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 };
const modalCard = { background: "#fff", width: "550px", borderRadius: "16px", padding: "30px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" };
const modalMainTitle = { margin: 0, fontSize: '18px', fontWeight: '600', color: '#111' };
const modalSubtitle = { margin: '4px 0 0 0', fontSize: '13px', color: '#666' };
const modalInnerCard = { backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', marginTop: '20px', overflow: 'hidden' };
const modalInnerHeader = { padding: '15px 20px', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const closeBtnIcon = { border: '1px solid #ddd', background: '#fff', borderRadius: '4px', cursor: 'pointer', fontSize: '18px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const modalForm = { padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' };
const formRow = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' };
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '5px' };
const labelStyle = { fontSize: '13px', fontWeight: '600' };
const inputStyle = { padding: '10px', borderRadius: '8px', border: '1px solid #ddd' };
const amountWrapper = { position: 'relative', display: 'flex', alignItems: 'center' };
const currencyPrefix = { position: 'absolute', left: '12px', color: '#666', fontSize: '14px' };
const amountInput = { ...inputStyle, width: '100%', paddingLeft: '25px' };
const textareaStyle = { ...inputStyle, minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' };
const modalFooter = { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' };
const cancelBtn = { padding: '10px 20px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' };
const saveBtnBlue = { padding: '10px 25px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' };
const saveBtnRed = { ...saveBtnBlue, background: '#ef4444' };

export default Dashboard;