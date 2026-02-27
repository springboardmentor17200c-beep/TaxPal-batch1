
import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const CategorySettings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("expense"); 
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

 
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const isMobile = windowWidth < 640;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchCategories();
  }, [user]);

  const filteredCategories = categories.filter(cat => cat.type === activeTab);

  const handleAddCategory = async () => {
    const name = prompt(`Enter new ${activeTab} category name:`);
    if (!name) return;

    const color = prompt("Enter a Hex color (e.g., #3b82f6) or leave blank for random:", "#3b82f6") 
                  || `#${Math.floor(Math.random()*16777215).toString(16)}`;

    try {
      const newCat = {
        name,
        type: activeTab,
        color: color,
        firebaseId: user.uid
      };
      
      await api.post("/categories", newCat);
      fetchCategories(); 
    } catch (err) {
      alert("Failed to add category.");
    }
  };

  const handleEdit = async (cat) => {
    const newName = prompt("Update category name:", cat.name);
    if (!newName || newName === cat.name) return;

    try {
      await api.put(`/categories/${cat._id}`, { name: newName });
      fetchCategories();
    } catch (err) {
      alert("Failed to update category.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Warning: Deleting this category will remove it from future dropdowns. Proceed?")) {
      try {
        await api.delete(`/categories/${id}`);
        fetchCategories(); 
      } catch (err) {
        alert("Failed to delete category.");
      }
    }
  };

  return (
    <div style={{...card, padding: isMobile ? "20px" : "32px"}}>
      <header style={{
        ...headerFlex, 
        flexDirection: isMobile ? "column" : "row", 
        alignItems: isMobile ? "flex-start" : "center",
        gap: isMobile ? "8px" : "0"
      }}>
        <h3 style={cardTitle}>Category Management</h3>
        <span style={userBadge}>User ID: {user?.uid.slice(0, 5)}...</span>
      </header>
      
      {/* TABS */}
      <div style={{...tabContainer, gap: isMobile ? "16px" : "24px"}}>
        <button 
          onClick={() => setActiveTab("expense")}
          style={{
            ...(activeTab === "expense" ? activeTabBtn : tabBtn),
            fontSize: isMobile ? "13px" : "14px",
            flex: isMobile ? 1 : "none"
          }}
        >
          Expenses
        </button>
        <button 
          onClick={() => setActiveTab("income")}
          style={{
            ...(activeTab === "income" ? activeTabBtn : tabBtn),
            fontSize: isMobile ? "13px" : "14px",
            flex: isMobile ? 1 : "none"
          }}
        >
          Income
        </button>
      </div>

      {/* CATEGORY LIST */}
      <div style={listContainer}>
        {loading ? (
          <div style={loaderContainer}>
             <p style={{color: '#94a3b8', fontSize: '14px'}}>Fetching...</p>
          </div>
        ) : filteredCategories.length > 0 ? (
          filteredCategories.map((cat) => (
            <div key={cat._id} style={listItem}>
              <div style={catInfo}>
                <div style={{ ...colorDot, backgroundColor: cat.color }}></div>
                <span style={catName}>{cat.name}</span>
              </div>
              <div style={actions}>
                <button onClick={() => handleEdit(cat)} style={iconBtn} title="Edit">✎</button>
                <button 
                  onClick={() => handleDelete(cat._id)} 
                  style={{ ...iconBtn, color: "#ef4444" }}
                  title="Delete"
                >
                  ×
                </button>
              </div>
            </div>
          ))
        ) : (
          <p style={emptyText}>No {activeTab} categories found.</p>
        )}
      </div>

      <button onClick={handleAddCategory} style={addBtn}>
        + Add {activeTab === 'expense' ? 'Expense' : 'Income'} Category
      </button>
    </div>
  );
};

// --- STYLES (PRESERVED & OPTIMIZED) ---
const card = { background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.02)", maxWidth: "600px", margin: "0 auto", boxSizing: "border-box" };
const headerFlex = { display: 'flex', justifyContent: 'space-between', marginBottom: '24px' };
const cardTitle = { margin: 0, fontSize: "18px", fontWeight: "600", color: "#1e293b" };
const userBadge = { fontSize: '11px', background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', color: '#64748b' };
const tabContainer = { display: "flex", borderBottom: "1px solid #f1f5f9", marginBottom: "20px" };
const tabBtn = { padding: "12px 0", border: "none", background: "none", cursor: "pointer", color: "#94a3b8", fontWeight: "600", transition: "all 0.2s" };
const activeTabBtn = { ...tabBtn, color: "#3b82f6", borderBottom: "2px solid #3b82f6" };
const listContainer = { display: "flex", flexDirection: "column", minHeight: '200px' };
const listItem = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid #f8fafc" };
const catInfo = { display: "flex", alignItems: "center", gap: "12px" };
const colorDot = { width: "10px", height: "10px", borderRadius: "50%", flexShrink: 0 };
const catName = { fontSize: "14px", fontWeight: "500", color: "#334155" };
const actions = { display: "flex", gap: "20px" }; // Increased gap for touch
const iconBtn = { background: "none", border: "none", cursor: "pointer", color: "#cbd5e1", fontSize: "20px", display: 'flex', alignItems: 'center', padding: "5px" };
const addBtn = { width: "100%", padding: "14px", borderRadius: "10px", border: "none", background: "#3b82f6", color: "#fff", fontWeight: "600", cursor: "pointer", fontSize: "14px", marginTop: "24px" };
const emptyText = { textAlign: 'center', color: '#94a3b8', padding: '40px 0', fontSize: '14px' };
const loaderContainer = { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' };

export default CategorySettings;