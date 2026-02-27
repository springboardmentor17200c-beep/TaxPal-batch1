const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// 1. Load environment variables FIRST
dotenv.config(); 

// 2. Import Database Connection and Routes
const connectDB = require('./config/db');
const transactionRoutes = require('./routes/transactionRoutes');
const userRoutes = require('./routes/userRoutes');
const budgetRoutes = require('./routes/budgetRoutes'); 
const categoryRoutes = require('./routes/categoryRoutes'); 
const taxRoutes = require('./routes/taxRoutes'); 
const reportRoutes = require('./routes/reportRoutes');

// 3. Initialize Database
connectDB();

const app = express();

// 4. Middleware
app.use(cors());
app.use(express.json());

// 5. Routes
app.get('/', (req, res) => res.send('TaxPal API is running...'));

// User Auth Routes
app.use('/api/users', userRoutes);

// Transaction Routes (General income/expense)
app.use('/api/transactions', transactionRoutes);

// Budget Routes (Dedicated logic for spending vs limits)
app.use('/api/budgets', budgetRoutes); 

// Category Management Routes
app.use('/api/categories', categoryRoutes); 

// Tax Estimator Routes
app.use('/api/tax', taxRoutes); 

// Financial Report Routes
app.use('/api/reports', reportRoutes); // ADDED: Mount the report generation endpoint

// 6. Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong on the server!' });
});

// 7. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});