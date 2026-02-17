import React, { useState } from "react";

const CategorySettings = () => {
  const [activeTab, setActiveTab] = useState("expense");
  
 
  const [expenseCategories] = useState([
    { id: 1, name: "Business Expenses", color: "#ef4444" },
    { id: 2, name: "Office Rent", color: "#0ea5e9" },
    { id: 3, name: "Software Subscriptions", color: "#8b5cf6" },
    { id: 4, name: "Professional Development", color: "#10b981" },
    { id: 5, name: "Marketing", color: "#f59e0b" },
    { id: 6, name: "Travel", color: "#ec4899" },
    { id: 7, name: "Meals & Entertainment", color: "#6366f1" },
    { id: 8, name: "Utilities", color: "#f43f5e" },
  ]);

  const [incomeCategories] = useState([
    { id: 1, name: "Salary", color: "#10b981" },
    { id: 2, name: "Freelance", color: "#3b82f6" },
    { id: 3, name: "Investments", color: "#8b5cf6" },
  ]);

  const categories = activeTab === "expense" ? expenseCategories : incomeCategories;

  return (
   
    <div style={card}>
      <h3 style={cardTitle}>Category Management</h3>
      
     
      <div style={tabContainer}>
        <button 
          onClick={() => setActiveTab("expense")}
          style={activeTab === "expense" ? activeTabBtn : tabBtn}
        >
          Expense Categories
        </button>
        <button 
          onClick={() => setActiveTab("income")}
          style={activeTab === "income" ? activeTabBtn : tabBtn}
        >
          Income Categories
        </button>
      </div>

   
      <div style={listContainer}>
        {categories.map((cat) => (
          <div key={cat.id} style={listItem}>
            <div style={catInfo}>
              <div style={{ ...colorDot, backgroundColor: cat.color }}></div>
              <span style={catName}>{cat.name}</span>
            </div>
            <div style={actions}>
              <button style={iconBtn}>✎</button>
              <button style={{ ...iconBtn, color: "#ef4444" }}>×</button>
            </div>
          </div>
        ))}
      </div>


      <button style={addBtn}>+ Add New Category</button>
    </div>
  );
};

// --- STYLES (Focused only on the Card) ---
const card = { 
  background: "#fff", 
  borderRadius: "16px", 
  border: "1px solid #e2e8f0", 
  padding: "32px", 
  boxShadow: "0 1px 3px rgba(0,0,0,0.02)" 
};

const cardTitle = { margin: "0 0 24px 0", fontSize: "18px", fontWeight: "600", color: "#1e293b" };

const tabContainer = { display: "flex", gap: "24px", borderBottom: "1px solid #f1f5f9", marginBottom: "20px" };

const tabBtn = { 
  padding: "12px 0", 
  border: "none", 
  background: "none", 
  cursor: "pointer", 
  color: "#94a3b8", 
  fontSize: "14px", 
  fontWeight: "600", 
  position: "relative",
  transition: "all 0.2s"
};

const activeTabBtn = { 
  ...tabBtn, 
  color: "#3b82f6", 
  borderBottom: "2px solid #3b82f6" 
};

const listContainer = { display: "flex", flexDirection: "column" };

const listItem = { 
  display: "flex", 
  justifyContent: "space-between", 
  alignItems: "center", 
  padding: "16px 0", 
  borderBottom: "1px solid #f8fafc" 
};

const catInfo = { display: "flex", alignItems: "center", gap: "12px" };
const colorDot = { width: "10px", height: "10px", borderRadius: "50%" };
const catName = { fontSize: "14px", fontWeight: "500", color: "#334155" };

const actions = { display: "flex", gap: "15px" };
const iconBtn = { background: "none", border: "none", cursor: "pointer", color: "#cbd5e1", fontSize: "16px" };

const addBtn = { 
  width: "100%", 
  padding: "12px", 
  borderRadius: "10px", 
  border: "none", 
  background: "#3b82f6", 
  color: "#fff", 
  fontWeight: "600", 
  cursor: "pointer", 
  fontSize: "14px", 
  marginTop: "20px" 
};

export default CategorySettings;