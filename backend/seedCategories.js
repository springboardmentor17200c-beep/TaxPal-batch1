const mongoose = require('mongoose');
const Category = require('./models/Category'); 
const dotenv = require('dotenv');
dotenv.config();

const seedData = [
  // Income
  { name: "Client Projects", type: "income", color: "#10b981", firebaseId: "GLOBAL" },
  { name: "Monthly Retainers", type: "income", color: "#34d399", firebaseId: "GLOBAL" },
  { name: "Product Sales", type: "income", color: "#059669", firebaseId: "GLOBAL" },
  { name: "Consulting", type: "income", color: "#6366f1", firebaseId: "GLOBAL" },
  { name: "Passive Income", type: "income", color: "#0ea5e9", firebaseId: "GLOBAL" },
  // Expense
  { name: "Office Rent", type: "expense", color: "#ef4444", firebaseId: "GLOBAL" },
  { name: "Software Subs", type: "expense", color: "#f97316", firebaseId: "GLOBAL" },
  { name: "Marketing & Ads", type: "expense", color: "#f59e0b", firebaseId: "GLOBAL" },
  { name: "Travel", type: "expense", color: "#eab308", firebaseId: "GLOBAL" },
  { name: "Hardware", type: "expense", color: "#6366f1", firebaseId: "GLOBAL" },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Category.insertMany(seedData);
    console.log("✅ Database Seeded Successfully!");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDB();