import React, { useState } from 'react';
import api from '../api/axios';

const TransactionForm = ({ onTransactionAdded }) => {
  const [formData, setFormData] = useState({
    amount: '',
    category: 'Salary',
    type: 'income',
    description: ''
  });

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

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
      <input 
        type="number" 
        placeholder="Amount" 
        value={formData.amount}
        onChange={(e) => setFormData({...formData, amount: e.target.value})}
        required 
      />
      <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </select>
      <input 
        type="text" 
        placeholder="Category (e.g. Rent, Food)" 
        value={formData.category}
        onChange={(e) => setFormData({...formData, category: e.target.value})}
      />
      <button type="submit" style={{ backgroundColor: '#4CAF50', color: 'white' }}>Add Transaction</button>
    </form>
  );
};

export default TransactionForm;