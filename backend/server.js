const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// 1. Load environment variables FIRST
dotenv.config(); 

// 2. Now import files that rely on those variables
const connectDB = require('./config/db');
const transactionRoutes = require('./routes/transactionRoutes');

// 3. Initialize DB
connectDB();

const app = express();

// 4. Middleware
app.use(cors());
app.use(express.json());

// 5. Routes
app.get('/', (req, res) => res.send('TaxPal API is running...'));
app.use('/api/transactions', transactionRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));