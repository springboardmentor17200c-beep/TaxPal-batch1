import React, { useState } from "react";

import CategoryManagement from "./CategorySettings"; 

const SettingsPage = () => {
  const [activeSubTab, setActiveSubTab] = useState("categories");

  return (
    <div style={settingsContainer}>
      <header style={settingsHeader}>
        <h2 style={settingsTitle}>Settings</h2>
        <p style={settingsSubtitle}>Manage your account settings and preferences</p>
      </header>

      <div style={settingsLayout}>
        {/* Sidebar Menu */}
        <aside style={settingsMenu}>
          <button 
            style={activeSubTab === "profile" ? activeMenuItem : menuItem} 
            onClick={() => setActiveSubTab("profile")}
          >
            👤 Profile
          </button>
          <button 
            style={activeSubTab === "categories" ? activeMenuItem : menuItem} 
            onClick={() => setActiveSubTab("categories")}
          >
            🏷️ Categories
          </button>
          <button 
            style={activeSubTab === "notifications" ? activeMenuItem : menuItem} 
            onClick={() => setActiveSubTab("notifications")}
          >
            🔔 Notifications
          </button>
          <button 
            style={activeSubTab === "security" ? activeMenuItem : menuItem} 
            onClick={() => setActiveSubTab("security")}
          >
            🔒 Security
          </button>
        </aside>

      =
        <section style={settingsContent}>
          {activeSubTab === "categories" && <CategoryManagement />}
          {activeSubTab === "profile" && <div>Profile Settings Coming Soon...</div>}
       
        </section>
      </div>
    </div>
  );
};

// --- STYLES ---
const settingsContainer = { padding: "20px" };
const settingsHeader = { marginBottom: "30px" };
const settingsTitle = { fontSize: "24px", fontWeight: "bold", margin: 0 };
const settingsSubtitle = { color: "#64748b", fontSize: "14px" };

const settingsLayout = { display: "flex", gap: "40px" };
const settingsMenu = { display: "flex", flexDirection: "column", gap: "10px", width: "200px" };

const menuItem = { 
  textAlign: "left", 
  padding: "10px 15px", 
  background: "none", 
  border: "none", 
  cursor: "pointer", 
  borderRadius: "8px", 
  color: "#64748b",
  fontSize: "14px"
};

const activeMenuItem = { 
  ...menuItem, 
  background: "#f1f5f9", 
  color: "#0f172a", 
  fontWeight: "600",
  border: "1px solid #e2e8f0" 
};

const settingsContent = { flex: 1 };

export default SettingsPage;