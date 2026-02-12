import React, { useState } from 'react';
import { auth, googleProvider } from '../firebase/config';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) { setError("Invalid credentials."); }
  };

  const handleGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/dashboard');
    } catch (err) { setError(err.message); }
  };

  return (
    <div style={authWrapper}>
      <div style={authCard}>
        <h2 style={brandTitle}>Tax<span>Pal</span></h2>
        <p style={subtitle}>Welcome back!</p>
        
        {error && <div style={errorBox}>{error}</div>}

        <button onClick={handleGoogle} style={googleBtn}>
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="18" alt=""/>
          Sign in with Google
        </button>

        <div style={divider}><span>or email login</span></div>

        <form onSubmit={handleLogin} style={formStack}>
          <input type="email" placeholder="Email Address" onChange={(e)=>setEmail(e.target.value)} style={inputField} required />
          <input type="password" placeholder="Password" onChange={(e)=>setPassword(e.target.value)} style={inputField} required />
          <button type="submit" style={primaryBtn}>Sign In</button>
        </form>

        <p style={footerText}>New to TaxPal? <Link to="/register" style={link}>Create account</Link></p>
      </div>
    </div>
  );
};

// (Reuses the styles from Register.jsx above)
const authWrapper = { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' };
const authCard = { background: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px', textAlign: 'center' };
const brandTitle = { fontSize: '28px', fontWeight: '800', marginBottom: '8px', color: '#111827' };
const subtitle = { color: '#6b7280', marginBottom: '24px' };
const inputField = { width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', boxSizing: 'border-box' };
const primaryBtn = { width: '100%', padding: '12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' };
const googleBtn = { width: '100%', padding: '12px', background: '#fff', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '16px' };
const divider = { margin: '20px 0', borderBottom: '1px solid #e5e7eb', position: 'relative' };
const errorBox = { background: '#fee2e2', color: '#b91c1c', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' };
const formStack = { textAlign: 'left' };
const footerText = { marginTop: '20px', fontSize: '14px', color: '#6b7280' };
const link = { color: '#2563eb', textDecoration: 'none', fontWeight: '600' };
export default Login;