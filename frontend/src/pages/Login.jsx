

import React, { useState } from 'react';
import { auth, googleProvider } from '../firebase/config';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); 
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error("Login Error Code:", err.code);
      if (err.code === 'auth/user-not-found') {
        setError("No account found with this email. Please register first.");
      } else if (err.code === 'auth/wrong-password') {
        setError("Incorrect password. Please try again.");
      } else if (err.code === 'auth/invalid-credential') {
        setError("Invalid email or password.");
      } else if (err.code === 'auth/too-many-requests') {
        setError("Too many failed attempts. Please try again later.");
      } else {
        setError("Failed to sign in. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/dashboard');
    } catch (err) {
      setError("Google sign-in was cancelled or failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={authWrapper}>
      <div style={authCard}>
        <h2 style={brandTitle}>Tax<span style={{color: '#2563eb'}}>Pal</span></h2>
        <p style={subtitle}>Welcome back!</p>
        
        {error && <div style={errorBox}>{error}</div>}

        <button onClick={handleGoogle} style={googleBtn} disabled={loading}>
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="18" alt=""/>
          {loading ? "Connecting..." : "Sign in with Google"}
        </button>

        <div style={divider}>
          <span style={dividerText}>or email login</span>
        </div>

        <form onSubmit={handleLogin} style={formStack}>
          <div style={{marginBottom: '16px'}}>
            <label style={labelStyle}>Email Address</label>
            <input 
              type="email" 
              placeholder="example@gmail.com" 
              onChange={(e)=>setEmail(e.target.value)} 
              style={inputField} 
              required 
            />
          </div>
          
          <div style={{marginBottom: '20px'}}>
            <label style={labelStyle}>Password</label>
            <div style={passwordWrapper}>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                onChange={(e)=>setPassword(e.target.value)} 
                style={passwordInput} 
                required 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                style={toggleBtn}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button type="submit" style={primaryBtn} disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p style={footerText}>
          New to TaxPal? <Link to="/register" style={link}>Create account</Link>
        </p>
      </div>
    </div>
  );
};

// --- Styles ---
const authWrapper = { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', padding: '20px' };
const authCard = { background: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px', textAlign: 'center' };
const brandTitle = { fontSize: '28px', fontWeight: '800', marginBottom: '8px', color: '#111827', letterSpacing: '-0.5px' };
const subtitle = { color: '#6b7280', marginBottom: '24px', fontSize: '15px' };
const labelStyle = { display: 'block', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' };
const inputField = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', boxSizing: 'border-box', fontSize: '14px' };

// Updated Password styles to accommodate the button
const passwordWrapper = { position: 'relative', width: '100%' };
const passwordInput = { ...inputField, paddingRight: '50px' };
const toggleBtn = { 
  position: 'absolute', 
  right: '10px', 
  top: '50%', 
  transform: 'translateY(-50%)', 
  background: 'none', 
  border: 'none', 
  color: '#2563eb', 
  fontSize: '12px', 
  fontWeight: '600', 
  cursor: 'pointer',
  padding: '5px'
};

const primaryBtn = { width: '100%', padding: '12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '15px' };
const googleBtn = { width: '100%', padding: '12px', background: '#fff', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '16px', fontWeight: '600', color: '#374151' };
const divider = { margin: '24px 0', borderBottom: '1px solid #e5e7eb', position: 'relative' };
const dividerText = { position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: '#fff', padding: '0 12px', fontSize: '12px', color: '#9ca3af' };
const errorBox = { background: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', border: '1px solid #fecaca', textAlign: 'left' };
const formStack = { textAlign: 'left' };
const footerText = { marginTop: '24px', fontSize: '14px', color: '#6b7280' };
const link = { color: '#2563eb', textDecoration: 'none', fontWeight: '600' };

export default Login;