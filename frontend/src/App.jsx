
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Layout
import Layout from "./components/Layout";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Budgets from "./pages/Budgets";
import SettingsPage from "./pages/SettingsPage"; 
import TaxEstimator from "./pages/TaxEstimator"; 
import Reports from "./pages/Reports";           

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={loaderStyle}>Loading TaxPal...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* --- PUBLIC ROUTES --- */}
        <Route path="/" element={<Home />} />
        
        {/* --- AUTH ROUTES --- */}
       
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/dashboard" replace />}
        />
        
       
        <Route
          path="/register"
          element={!user ? <Register /> : <Navigate to="/dashboard" replace />}
        />

        {/* --- PROTECTED ROUTES (Layout Wrapper) --- */}
    
        <Route element={user ? <Layout /> : <Navigate to="/login" replace />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/budgets" element={<Budgets />} />
          <Route path="/tax-estimator" element={<TaxEstimator />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* --- FALLBACK --- */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

const loaderStyle = {
  display: 'flex', 
  justifyContent: 'center', 
  alignItems: 'center', 
  height: '100vh', 
  fontSize: '18px', 
  color: '#3b82f6',
  fontFamily: 'sans-serif',
  fontWeight: '600'
};

export default App;