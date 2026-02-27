
import React, { useState, useEffect } from "react";
import CategoryManagement from "./CategorySettings"; 

const SettingsPage = () => {
  const [activeSubTab, setActiveSubTab] = useState("categories");


  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const isMobile = windowWidth < 768;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{...settingsContainer, padding: isMobile ? "15px" : "32px"}}>
      <header style={settingsHeader}>
        <h2 style={settingsTitle}>Settings</h2>
        <p style={settingsSubtitle}>Manage your account settings and preferences</p>
      </header>

      <div style={{
        ...settingsLayout, 
        flexDirection: isMobile ? "column" : "row",
        gap: isMobile ? "20px" : "40px"
      }}>
       
        <aside style={{
          ...settingsMenu, 
          flexDirection: isMobile ? "row" : "column",
          width: isMobile ? "100%" : "200px",
          overflowX: isMobile ? "auto" : "visible",
          paddingBottom: isMobile ? "10px" : "0",
          WebkitOverflowScrolling: "touch", 
        }}>
          <button 
            style={{
              ...(activeSubTab === "profile" ? activeMenuItem : menuItem),
              whiteSpace: isMobile ? "nowrap" : "normal"
            }} 
            onClick={() => setActiveSubTab("profile")}
          >
            👤 Profile
          </button>
          <button 
            style={{
              ...(activeSubTab === "categories" ? activeMenuItem : menuItem),
              whiteSpace: isMobile ? "nowrap" : "normal"
            }} 
            onClick={() => setActiveSubTab("categories")}
          >
            🏷️ Categories
          </button>
          <button 
            style={{
              ...(activeSubTab === "notifications" ? activeMenuItem : menuItem),
              whiteSpace: isMobile ? "nowrap" : "normal"
            }} 
            onClick={() => setActiveSubTab("notifications")}
          >
            🔔 Notifications
          </button>
          <button 
            style={{
              ...(activeSubTab === "security" ? activeMenuItem : menuItem),
              whiteSpace: isMobile ? "nowrap" : "normal"
            }} 
            onClick={() => setActiveSubTab("security")}
          >
            🔒 Security
          </button>
        </aside>

        {/* Content Area */}
        <section style={settingsContent}>
          {activeSubTab === "categories" && <CategoryManagement />}
          {activeSubTab === "profile" && <div style={emptyPlaceholder}>Profile Settings Coming Soon...</div>}
          {activeSubTab === "notifications" && <div style={emptyPlaceholder}>Notification Preferences Coming Soon...</div>}
          {activeSubTab === "security" && <div style={emptyPlaceholder}>Security & Password Coming Soon...</div>}
        </section>
      </div>
    </div>
  );
};

// --- STYLES ---
const settingsContainer = { maxWidth: "1200px", margin: "0 auto", fontFamily: "'Inter', sans-serif" };
const settingsHeader = { marginBottom: "30px" };
const settingsTitle = { fontSize: "24px", fontWeight: "bold", margin: 0, color: "#0f172a" };
const settingsSubtitle = { color: "#64748b", fontSize: "14px", marginTop: "4px" };

const settingsLayout = { display: "flex" };
const settingsMenu = { display: "flex", gap: "10px", flexShrink: 0 };

const menuItem = { 
  textAlign: "left", 
  padding: "10px 16px", 
  background: "none", 
  border: "1px solid transparent", 
  cursor: "pointer", 
  borderRadius: "8px", 
  color: "#64748b",
  fontSize: "14px",
  transition: "all 0.2s ease"
};

const activeMenuItem = { 
  ...menuItem, 
  background: "#f1f5f9", 
  color: "#3b82f6", 
  fontWeight: "600",
  border: "1px solid #e2e8f0" 
};

const settingsContent = { flex: 1, minWidth: 0 }; 
const emptyPlaceholder = { padding: "40px", textAlign: "center", background: "#f8fafc", borderRadius: "12px", color: "#94a3b8", border: "2px dashed #e2e8f0" };

export default SettingsPage;