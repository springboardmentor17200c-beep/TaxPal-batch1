

import React, { useState } from 'react';
import { auth, googleProvider } from '../firebase/config';
import { createUserWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth'; 
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    email: '',
    country: '',
    incomeBracket: 'middle' 
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); 
  const navigate = useNavigate();

  const handleInput = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

     
      await api.post('/users', {
        firebaseId: user.uid,
        name: user.displayName || formData.fullName || "Google User",
        email: user.email,
        country: "India", 
        income_bracket: "middle"
      });

      // Google users usually stay logged in and go straight to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError("Google Sign-In failed or account already exists.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match.");
    }

    setLoading(true);
    try {
      // Create user in Firebase (This automatically signs them in)
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

    
      await api.post('/users', {
        firebaseId: user.uid,
        name: formData.fullName,
        email: formData.email,
        country: formData.country,
        income_bracket: formData.incomeBracket,
      });

      // THE KEY STEP: Sign out immediately so they aren't auto-logged in!
      await signOut(auth); 

      // Navigate to Login
      alert("Registration successful! Please log in with your credentials.");
      navigate('/login');
      
    } catch (err) {
      
      let msg = "Failed to create account. Please try again.";
      if (err.code === 'auth/email-already-in-use') {
        msg = "This email is already registered. Please sign in instead.";
      } else if (err.code === 'auth/weak-password') {
        msg = "Password should be at least 6 characters.";
      } else if (err.code === 'auth/invalid-email') {
        msg = "The email address is not valid.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={container}>
      <div style={formWrapper}>
        <h2 style={title}>Create an Account</h2>
        <p style={subtitle}>Enter your information to create your TaxPal account</p>

        {error && <div style={errorBanner}>{error}</div>}

        <form onSubmit={handleRegister} style={formStyle}>
          <div style={inputGroup}>
            <label style={labelStyle}>Full Name</label>
            <input type="text" name="fullName" placeholder="Enter your full name" style={inputStyle} onChange={handleInput} required />
          </div>

          <div style={inputGroup}>
            <label style={labelStyle}>Email</label>
            <input type="email" name="email" placeholder="Enter your email address" style={inputStyle} onChange={handleInput} required />
          </div>

          <div style={inputGroup}>
            <label style={labelStyle}>Password</label>
            <div style={passwordContainer}>
              <input 
                type={showPassword ? "text" : "password"} 
                name="password" 
                placeholder="Choose a password" 
                style={passwordInput} 
                onChange={handleInput} 
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

          <div style={inputGroup}>
            <label style={labelStyle}>Confirm Password</label>
            <div style={passwordContainer}>
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                name="confirmPassword" 
                placeholder="Confirm your password" 
                style={passwordInput} 
                onChange={handleInput} 
                required 
              />
              <button 
                type="button" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                style={toggleBtn}
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div style={inputGroup}>
            <label style={labelStyle}>Country</label>
            <select name="country" style={inputStyle} onChange={handleInput} required>
              <option value="">Select your country</option>
              <option value="India">India</option>
              <option value="United States">United States</option>
              <option value="United Kingdom">United Kingdom</option>
            </select>
          </div>

          <button type="submit" style={submitBtn} disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div style={divider}>
          <span style={dividerText}>or</span>
        </div>

        <button onClick={handleGoogleSignUp} style={googleBtn} disabled={loading}>
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" style={{ width: '18px' }} />
          Sign up with Google
        </button>

        <p style={footerLink}>
          Already have an account? <Link to="/login" style={{ color: '#3b82f6', textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

// --- Styles ---
const container = { minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb', padding: '20px' };
const formWrapper = { backgroundColor: '#fff', width: '100%', maxWidth: '480px', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', textAlign: 'center' };
const title = { fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#111' };
const subtitle = { fontSize: '14px', color: '#666', marginBottom: '30px' };
const formStyle = { textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '18px' };
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '6px' };
const labelStyle = { fontSize: '13px', fontWeight: '600', color: '#333' };
const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '14px', outline: 'none', backgroundColor: '#fff' };
const passwordContainer = { position: 'relative', width: '100%' };
const passwordInput = { ...inputStyle, width: '100%', boxSizing: 'border-box', paddingRight: '50px' };
const toggleBtn = { position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#3b82f6', fontSize: '12px', fontWeight: '600', cursor: 'pointer', padding: '5px' };
const submitBtn = { marginTop: '10px', padding: '14px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '15px' };
const googleBtn = { width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontWeight: '600', color: '#374151', cursor: 'pointer', marginTop: '10px' };
const divider = { margin: '20px 0', borderBottom: '1px solid #e5e7eb', position: 'relative' };
const dividerText = { position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#fff', padding: '0 10px', color: '#9ca3af', fontSize: '12px' };
const errorBanner = { backgroundColor: '#fef2f2', color: '#dc2626', padding: '10px', borderRadius: '6px', fontSize: '13px', marginBottom: '20px', border: '1px solid #fecaca' };
const footerLink = { fontSize: '14px', color: '#666', marginTop: '20px' };

export default Register;