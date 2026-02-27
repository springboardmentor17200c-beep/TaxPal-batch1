import React, { useState, useEffect } from 'react';
import { auth, googleProvider } from '../firebase/config';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); 
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 480);
  const navigate = useNavigate();

  // Listen for screen size changes
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 480);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        setError("No account found with this email.");
      } else if (err.code === 'auth/wrong-password') {
        setError("Incorrect password.");
      } else {
        setError("Invalid credentials or connection error.");
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
      setError("Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={authWrapper}>
      <div style={{
        ...authCard,
        padding: isMobile ? '30px 20px' : '40px',
        maxWidth: isMobile ? '100%' : '400px',
        boxShadow: isMobile ? 'none' : '0 10px 25px rgba(0,0,0,0.05)',
      }}>
        <h2 style={brandTitle}>Tax<span style={{color: '#2563eb'}}>Pal</span></h2>
        <p style={subtitle}>Welcome back!</p>
        
        {error && <div style={errorBox}>{error}</div>}

        <button onClick={handleGoogle} style={googleBtn} disabled={loading}>
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="18" alt=""/>
          <span style={{fontSize: isMobile ? '14px' : '15px'}}>
            {loading ? "Connecting..." : "Sign in with Google"}
          </span>
        </button>

        <div style={divider}>
          <span style={dividerText}>or email login</span>
        </div>

        <form onSubmit={handleLogin} style={formStack}>
          <div style={{marginBottom: '16px'}}>
            <label style={labelStyle}>Email Address</label>
            <input 
              type="email" 
              placeholder="Enter your email address" 
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
const authWrapper = { 
  height: '100vh', 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center', 
  background: '#f3f4f6', 
  padding: '16px', // Smaller padding for mobile screens
  boxSizing: 'border-box'
};

const authCard = { 
  background: '#fff', 
  borderRadius: '12px', 
  width: '100%', 
  textAlign: 'center',
  boxSizing: 'border-box'
};

const brandTitle = { fontSize: '28px', fontWeight: '800', marginBottom: '8px', color: '#111827', letterSpacing: '-0.5px' };
const subtitle = { color: '#6b7280', marginBottom: '24px', fontSize: '15px' };
const labelStyle = { display: 'block', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' };

const inputField = { 
  width: '100%', 
  padding: '14px 12px', 
  borderRadius: '8px', 
  border: '1px solid #d1d5db', 
  outline: 'none', 
  boxSizing: 'border-box', 
  fontSize: '16px', 
  appearance: 'none'
};

const passwordWrapper = { position: 'relative', width: '100%' };
const passwordInput = { ...inputField, paddingRight: '60px' };
const toggleBtn = { 
  position: 'absolute', 
  right: '10px', 
  top: '50%', 
  transform: 'translateY(-50%)', 
  background: 'none', 
  border: 'none', 
  color: '#2563eb', 
  fontSize: '13px', 
  fontWeight: '600', 
  cursor: 'pointer',
  padding: '10px'
};

const primaryBtn = { 
  width: '100%', 
  padding: '14px', 
  background: '#2563eb', 
  color: '#fff', 
  border: 'none', 
  borderRadius: '8px', 
  fontWeight: '600', 
  cursor: 'pointer', 
  fontSize: '16px' 
};

const googleBtn = { 
  width: '100%', 
  padding: '12px', 
  background: '#fff', 
  border: '1px solid #d1d5db', 
  borderRadius: '8px', 
  cursor: 'pointer', 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center', 
  gap: '10px', 
  marginBottom: '16px', 
  fontWeight: '600', 
  color: '#374151' 
};

const divider = { margin: '24px 0', borderBottom: '1px solid #e5e7eb', position: 'relative' };
const dividerText = { position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: '#fff', padding: '0 12px', fontSize: '12px', color: '#9ca3af' };
const errorBox = { background: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', border: '1px solid #fecaca', textAlign: 'left' };
const formStack = { textAlign: 'left' };
const footerText = { marginTop: '24px', fontSize: '14px', color: '#6b7280' };
const link = { color: '#2563eb', textDecoration: 'none', fontWeight: '600' };

export default Login;