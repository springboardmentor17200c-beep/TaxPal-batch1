import React, { useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { auth } from "../firebase/config";
import { signOut } from "firebase/auth";

const Layout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <div style={layoutContainer}>
      {/* MOBILE MENU BUTTON */}
      <div className="mobile-menu-button" style={mobileMenuButton}>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} style={menuButtonStyle}>
          {sidebarOpen ? '✕' : '☰'}
        </button>
        <div style={mobileLogo}>TaxPal</div>
      </div>

      {/* MOBILE SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <div className="mobile-overlay" style={mobileOverlay} onClick={() => setSidebarOpen(false)}>
          <div className="mobile-sidebar" style={mobileSidebar} onClick={(e) => e.stopPropagation()}>
            <div style={{ flex: 1 }}>
              <div style={logoStyle}>TaxPal</div>
              <nav style={navStyle}>
                <div onClick={() => { navigate("/dashboard"); setSidebarOpen(false); }} style={isActive("/dashboard") ? activeNavItem : navItem}>
                   <span style={iconSpan}>🏠</span> Dashboard
                </div>
                <div onClick={() => { navigate("/transactions"); setSidebarOpen(false); }} style={isActive("/transactions") ? activeNavItem : navItem}>
                   <span style={iconSpan}>🔄</span> Transactions
                </div>
                <div onClick={() => { navigate("/budgets"); setSidebarOpen(false); }} style={isActive("/budgets") ? activeNavItem : navItem}>
                   <span style={iconSpan}>⏱️</span> Budgets
                </div>
                <div onClick={() => { navigate("/tax-estimator"); setSidebarOpen(false); }} style={isActive("/tax-estimator") ? activeNavItem : navItem}>
                   <span style={iconSpan}>📄</span> Tax Estimator
                </div>
                <div onClick={() => { navigate("/reports"); setSidebarOpen(false); }} style={isActive("/reports") ? activeNavItem : navItem}>
                   <span style={iconSpan}>📊</span> Reports
                </div>
              </nav>
            </div>

            {/* PROFILE SECTION */}
            <div style={profileSection}>
              <div 
                style={{
                    ...userInfo, 
                    backgroundColor: isActive("/settings") ? "#f1f5f9" : "transparent"
                }} 
                onClick={() => { navigate("/settings"); setSidebarOpen(false); }}
                title="Account Settings"
              >
                <div style={avatar}>
                  {user?.email ? user.email[0].toUpperCase() : "A"}
                </div>
                <div style={userMeta}>
                  <span style={userName}>{user?.displayName || "User Account"}</span>
                  <span style={userEmail}>{user?.email}</span>
                </div>
              </div>
              
              <div style={footerActions}>
                <button onClick={handleLogout} style={logoutBtn}>
                  <span style={{marginRight: '6px'}}>↪</span> Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside style={sidebarStyle}>
        <div style={{ flex: 1 }}>
          <div style={logoStyle}>TaxPal</div>
          <nav style={navStyle}>
            <div onClick={() => navigate("/dashboard")} style={isActive("/dashboard") ? activeNavItem : navItem}>
               <span style={iconSpan}>🏠</span> Dashboard
            </div>
            <div onClick={() => navigate("/transactions")} style={isActive("/transactions") ? activeNavItem : navItem}>
               <span style={iconSpan}>🔄</span> Transactions
            </div>
            <div onClick={() => navigate("/budgets")} style={isActive("/budgets") ? activeNavItem : navItem}>
               <span style={iconSpan}>⏱️</span> Budgets
            </div>
            <div onClick={() => navigate("/tax-estimator")} style={isActive("/tax-estimator") ? activeNavItem : navItem}>
               <span style={iconSpan}>📄</span> Tax Estimator
            </div>
            <div onClick={() => navigate("/reports")} style={isActive("/reports") ? activeNavItem : navItem}>
               <span style={iconSpan}>📊</span> Reports
            </div>
          </nav>
        </div>

        {/* PROFILE SECTION */}
        <div style={profileSection}>
          <div 
            style={{
                ...userInfo, 
                backgroundColor: isActive("/settings") ? "#f1f5f9" : "transparent"
            }} 
            onClick={() => navigate("/settings")}
            title="Account Settings"
          >
            <div style={avatar}>
              {user?.email ? user.email[0].toUpperCase() : "A"}
            </div>
            <div style={userMeta}>
              <span style={userName}>{user?.displayName || "User Account"}</span>
              <span style={userEmail}>{user?.email}</span>
            </div>
          </div>
          
          <div style={footerActions}>
            <button onClick={handleLogout} style={logoutBtn}>
              <span style={{marginRight: '6px'}}>↪</span> Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* PAGE CONTENT */}
      <main style={mainContent}>
        <div style={contentWrapper}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

// --- STYLES ---
const layoutContainer = { display: "flex", height: "100vh", backgroundColor: "#fff" };
const sidebarStyle = { width: "260px", backgroundColor: "#fff", borderRight: "1px solid #f1f5f9", padding: "32px 16px", display: "flex", flexDirection: "column" };
const logoStyle = { fontSize: "24px", fontWeight: "800", color: "#0f172a", padding: "0 12px", marginBottom: "40px", letterSpacing: '-1px' };
const navStyle = { display: "flex", flexDirection: "column", gap: "6px" };
const navItem = { padding: "12px 16px", borderRadius: "10px", color: "#64748b", cursor: "pointer", fontSize: "14px", fontWeight: '600', display: "flex", alignItems: "center", transition: "all 0.2s" };
const activeNavItem = { ...navItem, backgroundColor: "#f1f5f9", color: "#0f172a" };
const iconSpan = { marginRight: "12px", fontSize: "16px" };

const profileSection = { 
  borderTop: "1px solid #f1f5f9", 
  paddingTop: "20px", 
  marginTop: "20px" 
};

const userInfo = { 
  display: "flex", 
  alignItems: "center", 
  gap: "12px", 
  marginBottom: "8px", 
  cursor: "pointer",
  padding: "10px",
  borderRadius: "12px",
  transition: "all 0.2s ease"
};

const avatar = { width: "38px", height: "38px", borderRadius: "10px", backgroundColor: "#0f172a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" };
const userMeta = { display: "flex", flexDirection: "column", overflow: "hidden" };
const userName = { fontSize: "13px", fontWeight: "700", color: '#0f172a' };
const userEmail = { fontSize: "11px", color: "#94a3b8", whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' };

const footerActions = { padding: "0 10px" };
const logoutBtn = { 
  background: "none", 
  border: "none", 
  fontSize: "12px", 
  color: "#ef4444", 
  fontWeight: "600", 
  cursor: "pointer", 
  display: "flex", 
  alignItems: "center",
  padding: "8px 0",
  width: "100%"
};

const mainContent = { flex: 1, backgroundColor: "#f8fafc", overflowY: "auto" };
const contentWrapper = { maxWidth: "1200px", margin: "0 auto", padding: "40px" };

// Mobile responsive styles
const mobileMenuButton = { 
  display: "none", 
  alignItems: "center", 
  justifyContent: "space-between", 
  padding: "16px 20px", 
  backgroundColor: "#fff", 
  borderBottom: "1px solid #f1f5f9",
  position: "sticky",
  top: 0,
  zIndex: 100
};

const menuButtonStyle = { 
  background: "none", 
  border: "none", 
  fontSize: "20px", 
  cursor: "pointer", 
  padding: "8px",
  borderRadius: "8px",
  backgroundColor: "#f8fafc"
};

const mobileLogo = { 
  fontSize: "20px", 
  fontWeight: "800", 
  color: "#0f172a", 
  letterSpacing: '-1px' 
};

const mobileOverlay = { 
  position: "fixed", 
  top: 0, 
  left: 0, 
  width: "100%", 
  height: "100%", 
  backgroundColor: "rgba(0, 0, 0, 0.5)", 
  zIndex: 1000,
  display: "flex"
};

const mobileSidebar = { 
  width: "280px", 
  backgroundColor: "#fff", 
  height: "100%", 
  padding: "32px 16px", 
  display: "flex", 
  flexDirection: "column",
  boxShadow: "2px 0 10px rgba(0,0,0,0.1)"
};

export default Layout;