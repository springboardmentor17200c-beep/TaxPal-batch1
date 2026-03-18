

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Home = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div style={container}>

      {/* NAVBAR */}
      <header style={nav}>
        <h1 style={logo}>TaxPal</h1>

        <div style={navLinks}>
          <Link to="/login" style={link}>Login</Link>
          <Link to="/register" style={registerBtn}>Register</Link>
        </div>
      </header>


      {/* HERO SECTION */}
      <section style={hero}>
        <h2 style={heroTitle}>
          Smart Finance & Tax Management
        </h2>

        <p style={heroText}>
          Track your income, manage expenses, and prepare for tax season
          without the stress. TaxPal keeps your finances organized.
        </p>

        <Link to="/register" style={cta}>
          Get Started Free
        </Link>
      </section>


      {/* FEATURES */}
      <section style={section}>
        <h2 style={sectionTitle}>Powerful Features</h2>

        <div style={grid}>
          <Feature
            icon="🚀"
            title="Quick Transactions"
            text="Add income and expenses in seconds from anywhere."
          />

          <Feature
            icon="📊"
            title="Smart Insights"
            text="Visualize your spending with charts and analytics."
          />

          <Feature
            icon="🔒"
            title="Secure Data"
            text="Firebase powered authentication and secure storage."
          />

          <Feature
            icon="📑"
            title="Summary Reports"
            text="Generate and download comprehensive summary reports."
          />

          <Feature
            icon="📅"
            title="Detailed Breakdowns"
            text="View your finances with monthly and quarterly breakdowns."
          />

          <Feature
            icon="📥"
            title="Easy Exports"
            text="Export your data seamlessly in PDF or CSV formats."
          />
        </div>
      </section>


      {/* HOW IT WORKS */}
      <section style={sectionAlt}>
        <h2 style={sectionTitle}>How TaxPal Works</h2>

        <div style={grid}>
          <Step
            number="1"
            title="Create an Account"
            text="Register quickly and access your financial dashboard."
          />

          <Step
            number="2"
            title="Track Transactions"
            text="Log income and expenses to stay organized."
          />

          <Step
            number="3"
            title="View Reports"
            text="Understand your finances with simple reports."
          />
        </div>
      </section>


      {/* WHY CHOOSE US */}
      <section style={section}>
        <h2 style={sectionTitle}>Why Choose TaxPal?</h2>

        <div style={grid}>
          <Benefit
            title="Save Time"
            text="Automated tracking means less manual work."
          />

          <Benefit
            title="Stay Organized"
            text="All your financial data in one clean dashboard."
          />

          <Benefit
            title="Tax Ready"
            text="Prepare for tax season with accurate records."
          />
        </div>
      </section>


      {/* CTA */}
      <section style={ctaSection}>
        <h2 style={{fontSize:"2rem"}}>Start Managing Your Finances Today</h2>
        <p style={{color:"#64748b"}}>
          Join thousands of users who trust TaxPal
        </p>

        <Link to="/register" style={cta}>
          Create Free Account
        </Link>
      </section>


      {/* FOOTER */}
      <footer style={footer}>
        © 2026 TaxPal Systems. All Rights Reserved.
      </footer>

    </div>
  );
};



/* COMPONENTS */

const Feature = ({icon,title,text}) => (
  <div style={card}>
    <div style={{fontSize:"2rem"}}>{icon}</div>
    <h3>{title}</h3>
    <p style={{color:"#64748b"}}>{text}</p>
  </div>
)

const Step = ({number,title,text}) => (
  <div style={card}>
    <div style={stepCircle}>{number}</div>
    <h3>{title}</h3>
    <p style={{color:"#64748b"}}>{text}</p>
  </div>
)

const Benefit = ({title,text}) => (
  <div style={card}>
    <h3>{title}</h3>
    <p style={{color:"#64748b"}}>{text}</p>
  </div>
)



/* STYLES */

const container={
  fontFamily:"Inter, sans-serif",
  color:"#1e293b"
}

const nav={
  display:"flex",
  justifyContent:"space-between",
  alignItems:"center",
  padding:"20px 10%",
  borderBottom:"1px solid #eee"
}

const logo={
  color:"#2563eb",
  fontWeight:"800"
}

const navLinks={
  display:"flex",
  gap:"10px"
}

const link={
  textDecoration:"none",
  padding:"8px 16px",
  color:"#334155",
  fontWeight:"600"
}

const registerBtn={
  textDecoration:"none",
  padding:"8px 16px",
  background:"#2563eb",
  color:"white",
  borderRadius:"6px",
  fontWeight:"600"
}

const hero={
  textAlign:"center",
  padding:"100px 20px",
  background:"#f8fafc"
}

const heroTitle={
  fontSize:"3rem",
  fontWeight:"800"
}

const heroText={
  maxWidth:"600px",
  margin:"20px auto",
  color:"#64748b"
}

const cta={
  padding:"14px 28px",
  background:"#10b981",
  color:"white",
  textDecoration:"none",
  borderRadius:"8px",
  fontWeight:"700",
  display:"inline-block",
  marginTop:"10px"
}

const section={
  padding:"80px 10%",
  textAlign:"center"
}

const sectionAlt={
  padding:"80px 10%",
  background:"#f8fafc",
  textAlign:"center"
}

const sectionTitle={
  fontSize:"2rem",
  marginBottom:"40px"
}

const grid={
  display:"flex",
  gap:"30px",
  justifyContent:"center",
  flexWrap:"wrap"
}

const card={
  maxWidth:"280px",
  padding:"20px"
}

const stepCircle={
  width:"40px",
  height:"40px",
  background:"#2563eb",
  color:"white",
  borderRadius:"50%",
  display:"flex",
  alignItems:"center",
  justifyContent:"center",
  margin:"0 auto 10px"
}

const ctaSection={
  textAlign:"center",
  padding:"80px 20px",
  background:"#ecfeff"
}

const footer={
  textAlign:"center",
  padding:"40px",
  color:"#94a3b8",
  borderTop:"1px solid #eee"
}

export default Home;