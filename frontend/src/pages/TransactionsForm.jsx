import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const TransactionForm = ({ onTransactionAdded }) => {
  const [formData, setFormData] = useState({
    amount: '',
    category: 'Salary',
    type: 'income',
    description: ''
  });

 
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const isMobile = windowWidth < 600;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/transactions', formData);
      setFormData({ amount: '', category: 'Salary', type: 'income', description: '' });
      onTransactionAdded(); 
    } catch (err) {
      alert("Error saving transaction");
    }
  };


  const formGridStyle = {
    display: 'grid',
   
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
    gap: '12px',
    marginBottom: '20px',
    padding: isMobile ? '10px' : '0'
  };

  const inputStyle = {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    width: '100%',
    boxSizing: 'border-box'
  };

  const buttonStyle = {
    backgroundColor: formData.type === 'income' ? '#10b981' : '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'opacity 0.2s'
  };

  return (
    <form onSubmit={handleSubmit} style={formGridStyle}>
      <input 
        type="number" 
        placeholder="Amount" 
        style={inputStyle}
        value={formData.amount}
        onChange={(e) => setFormData({...formData, amount: e.target.value})}
        required 
      />
      
      <select 
        style={inputStyle} 
        value={formData.type} 
        onChange={(e) => setFormData({...formData, type: e.target.value})}
      >
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </select>

      <input 
        type="text" 
        placeholder="Category" 
        style={inputStyle}
        value={formData.category}
        onChange={(e) => setFormData({...formData, category: e.target.value})}
      />

      <button type="submit" style={buttonStyle}>
        Add {formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}
      </button>
    </form>
  );
};

export default TransactionForm;