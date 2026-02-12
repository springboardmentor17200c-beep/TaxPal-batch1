import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div style={containerStyle}>
      <header style={navStyle}>
        <h1 style={{ color: '#007bff', margin: 0 }}>TaxPal</h1>
        <div>
          <Link to="/login" style={linkStyle}>Login</Link>
          <Link to="/register" style={{...linkStyle, backgroundColor: '#007bff', color: 'white', borderRadius: '5px'}}>Register</Link>
        </div>
      </header>

      <main style={heroStyle}>
        <h2 style={{ fontSize: '3rem', marginBottom: '20px' }}>Smart Finance & Tax Management</h2>
        <p style={{ fontSize: '1.2rem', color: '#555', maxWidth: '600px', margin: '0 auto 30px' }}>
          Track your income, manage expenses, and prepare for tax season with ease. 
          The simple way to stay on top of your money.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <Link to="/register" style={ctaButtonStyle}>Get Started for Free</Link>
        </div>
      </main>

      <section style={featureSectionStyle}>
        <div style={featureStyle}>
          <h3>🚀 Easy Logging</h3>
          <p>Record transactions in seconds from any device.</p>
        </div>
        <div style={featureStyle}>
          <h3>📊 Visual Insights</h3>
          <p>See where your money goes with intuitive charts.</p>
        </div>
        <div style={featureStyle}>
          <h3>🔒 Secure</h3>
          <p>Your data is protected with Firebase & Industry Standards.</p>
        </div>
      </section>
    </div>
  );
};

// --- Styles ---
const containerStyle = { fontFamily: 'Arial, sans-serif', color: '#333', lineHeight: '1.6' };

const navStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '20px 10%',
  borderBottom: '1px solid #eee'
};

const linkStyle = {
  textDecoration: 'none',
  marginLeft: '20px',
  padding: '8px 16px',
  color: '#333',
  fontWeight: 'bold'
};

const heroStyle = {
  padding: '100px 10%',
  textAlign: 'center',
  backgroundColor: '#f8f9fa'
};

const ctaButtonStyle = {
  padding: '15px 30px',
  backgroundColor: '#28a745',
  color: 'white',
  textDecoration: 'none',
  borderRadius: '5px',
  fontSize: '1.1rem',
  fontWeight: 'bold'
};

const featureSectionStyle = {
  display: 'flex',
  justifyContent: 'space-around',
  padding: '50px 10%',
  textAlign: 'center'
};

const featureStyle = { flex: 1, padding: '20px' };

export default Home;