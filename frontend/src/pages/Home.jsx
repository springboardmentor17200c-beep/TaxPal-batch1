import React, { useState, useEffect } from 'react'; 
import { Link } from 'react-router-dom';

const Home = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);


  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={containerStyle}>
  
      <header style={{
        ...navStyle,
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '15px' : '0',
        padding: isMobile ? '15px 5%' : '20px 10%',
        textAlign: isMobile ? 'center' : 'left'
      }}>
        <h1 style={{ 
          color: '#007bff', 
          margin: 0, 
          fontSize: isMobile ? '1.8rem' : '2.2rem',
          fontWeight: '800' 
        }}>
          TaxPal
        </h1>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <Link to="/login" style={linkStyle}>Login</Link>
          <Link to="/register" style={{
            ...linkStyle, 
            backgroundColor: '#007bff', 
            color: 'white', 
            borderRadius: '8px'
          }}>
            Register
          </Link>
        </div>
      </header>

     
      <main style={{
        ...heroStyle,
        padding: isMobile ? '60px 20px' : '100px 10%',
      }}>
        <h2 style={{ 
          fontSize: isMobile ? '2.2rem' : '3.5rem', 
          marginBottom: '20px',
          lineHeight: '1.1',
          fontWeight: '800',
          color: '#1e293b'
        }}>
          Smart Finance & <br /> Tax Management
        </h2>
        <p style={{ 
          fontSize: isMobile ? '1rem' : '1.25rem', 
          color: '#64748b', 
          maxWidth: '700px', 
          margin: '0 auto 40px',
          lineHeight: '1.6'
        }}>
          Track your income, manage expenses, and prepare for tax season with ease. 
          The simple way to stay on top of your money.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Link to="/register" style={{
            ...ctaButtonStyle,
            width: isMobile ? '100%' : 'auto',
            textAlign: 'center',
            fontSize: isMobile ? '1rem' : '1.1rem'
          }}>
            Get Started for Free
          </Link>
        </div>
      </main>

    
      <section style={{
        ...featureSectionStyle,
        flexDirection: isMobile ? 'column' : 'row',
        padding: isMobile ? '40px 20px' : '80px 10%',
        gap: isMobile ? '30px' : '40px'
      }}>
        <div style={{...featureStyle, borderBottom: isMobile ? '1px solid #f1f5f9' : 'none'}}>
          <div style={iconCircle}>🚀</div>
          <h3 style={featureTitle}>Easy Logging</h3>
          <p style={featureText}>Record transactions in seconds from any device.</p>
        </div>
        <div style={{...featureStyle, borderBottom: isMobile ? '1px solid #f1f5f9' : 'none'}}>
          <div style={iconCircle}>📊</div>
          <h3 style={featureTitle}>Visual Insights</h3>
          <p style={featureText}>See where your money goes with intuitive charts.</p>
        </div>
        <div style={featureStyle}>
          <div style={iconCircle}>🔒</div>
          <h3 style={featureTitle}>Secure</h3>
          <p style={featureText}>Your data is protected with Firebase & Industry Standards.</p>
        </div>
      </section>
      
      <footer style={footerStyle}>
        © 2026 TaxPal Systems. Built for clarity.
      </footer>
    </div>
  );
};


const containerStyle = { 
  fontFamily: "'Inter', sans-serif", 
  color: '#1e293b', 
  lineHeight: '1.6',
  backgroundColor: '#ffffff'
};

const navStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '1px solid #f1f5f9'
};

const linkStyle = {
  textDecoration: 'none',
  padding: '10px 20px',
  color: '#475569',
  fontWeight: '600',
  fontSize: '0.95rem',
  transition: '0.2s'
};

const heroStyle = {
  textAlign: 'center',
  backgroundColor: '#f8fafc',
};

const ctaButtonStyle = {
  padding: '16px 32px',
  backgroundColor: '#10b981', 
  color: 'white',
  textDecoration: 'none',
  borderRadius: '10px',
  fontWeight: '700',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  transition: '0.3s'
};

const featureSectionStyle = {
  display: 'flex',
  justifyContent: 'center',
  textAlign: 'center',
};

const iconCircle = {
  fontSize: '2.5rem',
  marginBottom: '15px'
};

const featureStyle = { 
  flex: 1, 
  padding: '20px',
  maxWidth: '350px' 
};

const featureTitle = { 
  marginBottom: '12px', 
  fontSize: '1.4rem', 
  fontWeight: '700',
  color: '#0f172a'
};

const featureText = { 
  color: '#64748b', 
  fontSize: '1rem' 
};

const footerStyle = {
  textAlign: 'center',
  padding: '40px',
  fontSize: '0.9rem',
  color: '#94a3b8',
  borderTop: '1px solid #f1f5f9'
};

export default Home;