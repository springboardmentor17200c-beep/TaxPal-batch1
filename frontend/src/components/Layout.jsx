



import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { auth } from "../firebase/config";
import { signOut } from "firebase/auth";

// --- STYLES DEFINED FIRST TO PREVENT NO-UNDEF ERRORS ---
const layoutContainer = { display: "flex", height: "100vh", backgroundColor: "#fff", overflow: "hidden" };

const mobileHeader = {
  position: "fixed", top: 0, left: 0, right: 0, height: "64px",
  backgroundColor: "#fff", borderBottom: "1px solid #f1f5f9",
  display: "flex", alignItems: "center", justifyContent: "space-between",
  padding: "0 16px", zIndex: 1100
};

const overlay = {
  position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: "rgba(0,0,0,0.3)", zIndex: 1050
};

const sidebarStyle = { 
  backgroundColor: "#fff", borderRight: "1px solid #f1f5f9", 
  padding: "32px 16px", flexDirection: "column",
  transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  height: "100vh", zIndex: 1200, top: 0, left: 0,
  boxSizing: "border-box"
};

const hamburgerBtn = { background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "#0f172a", padding: "8px" };
const logoStyle = { fontSize: "24px", fontWeight: "800", color: "#0f172a", padding: "0 12px", marginBottom: "40px", letterSpacing: '-1px' };
const logoStyleMobile = { fontSize: "20px", fontWeight: "800", color: "#0f172a", letterSpacing: '-1px' };

const navStyle = { display: "flex", flexDirection: "column", gap: "4px" };
const navItem = { padding: "12px 16px", borderRadius: "10px", color: "#64748b", cursor: "pointer", fontSize: "14px", fontWeight: '600', display: "flex", alignItems: "center" };
const activeNavItem = { ...navItem, backgroundColor: "#f1f5f9", color: "#3b82f6" };
const iconSpan = { marginRight: "12px", fontSize: "18px" };

const profileSection = { 
  borderTop: "1px solid #f1f5f9", 
  paddingTop: "24px", 
  marginTop: "auto", 
  paddingBottom: "40px", 
  backgroundColor: "#fff" 
};

const userInfo = { display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", cursor: "pointer", padding: "10px", borderRadius: "12px" };
const avatar = { minWidth: "42px", height: "42px", borderRadius: "10px", backgroundColor: "#0f172a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" };
const avatarSmall = { ...avatar, minWidth: "32px", height: "32px", fontSize: '12px' };
const userMeta = { display: "flex", flexDirection: "column", overflow: "hidden" };
const userName = { fontSize: "14px", fontWeight: "700", color: '#0f172a' };
const userEmail = { fontSize: "12px", color: "#94a3b8", whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' };

const footerActions = { padding: "0 4px" };
const logoutBtn = { 
  background: "#fef2f2", border: "1px solid #fee2e2", 
  fontSize: "14px", color: "#ef4444", fontWeight: "700", 
  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: 'center',
  padding: "14px", width: "100%", borderRadius: "12px", transition: '0.2s'
};

const mainContent = { flex: 1, backgroundColor: "#f8fafc", overflowY: "auto", position: "relative" };
const contentWrapper = { maxWidth: "1200px", margin: "0 auto" };
const mobileProfile = { cursor: "pointer", padding: "4px" };

// --- COMPONENT ---
const Layout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setIsMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: "🏠" },
    { name: "Transactions", path: "/transactions", icon: "🔄" },
    { name: "Budgets", path: "/budgets", icon: "⏱️" },
    { name: "Tax Estimator", path: "/tax-estimator", icon: "📄" },
    { name: "Reports", path: "/reports", icon: "📊" },
  ];

  return (
    <div style={layoutContainer}>
      {isMobile && (
        <header style={mobileHeader}>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} style={hamburgerBtn}>
            {isMenuOpen ? "✕" : "☰"}
          </button>
          <div style={logoStyleMobile}>TaxPal</div>
          <div style={mobileProfile} onClick={() => navigate("/settings")}>
            <div style={avatarSmall}>
              {user?.email ? user.email[0].toUpperCase() : "U"}
            </div>
          </div>
        </header>
      )}

      {isMobile && isMenuOpen && <div style={overlay} onClick={() => setIsMenuOpen(false)} />}

      <aside
        style={{
          ...sidebarStyle,
          transform: isMobile && !isMenuOpen ? "translateX(-100%)" : "translateX(0)",
          position: isMobile ? "fixed" : "relative",
          width: isMobile ? "280px" : "260px",
          display: "flex",
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={logoStyle}>{isMobile ? "Menu" : "TaxPal"}</div>
          <nav style={navStyle}>
            {navItems.map((item) => (
              <div
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setIsMenuOpen(false);
                }}
                style={isActive(item.path) ? activeNavItem : navItem}
              >
                <span style={iconSpan}>{item.icon}</span> {item.name}
              </div>
            ))}
          </nav>
        </div>

        <div style={profileSection}>
          <div
            style={{
              ...userInfo,
              backgroundColor: isActive("/settings") ? "#f1f5f9" : "transparent",
            }}
            onClick={() => {
              navigate("/settings");
              setIsMenuOpen(false);
            }}
          >
            <div style={avatar}>
              {user?.email ? user.email[0].toUpperCase() : "U"}
            </div>
            <div style={userMeta}>
              <span style={userName}>{user?.displayName || "User"}</span>
              <span style={userEmail}>{user?.email}</span>
            </div>
          </div>

          <div style={footerActions}>
            <button onClick={handleLogout} style={logoutBtn}>
              <span style={{ marginRight: "8px" }}>↪</span> Sign out
            </button>
          </div>
        </div>
      </aside>

      <main style={mainContent}>
        <div style={{ ...contentWrapper, padding: isMobile ? "85px 20px 60px 20px" : "40px" }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;