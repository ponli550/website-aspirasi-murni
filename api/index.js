const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const paymentRoutes = require('../backend/routes/paymentRoutes');
const studentRoutes = require('../backend/routes/studentRoutes');
const dashboardRoutes = require('../backend/routes/dashboardRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: true,  // Allow all origins in serverless environment
  credentials: true
}));
app.use(express.json());

// Connect to MongoDB before handling requests
app.use(async (req, res, next) => {
  // Skip MongoDB connection for test endpoints
  if (req.path === '/api' || req.path === '/api/simple-test' || req.path === '/api/diagnose' || req.path === '/api/mongo-test') {
    return next();
  }
  
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    console.error('Database connection error:', error);
    return res.status(500).json({
      message: 'Database connection error',
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
      ip_troubleshooting: 'This may be an IP whitelisting issue. Verify that your current IP address is whitelisted in MongoDB Atlas Network Access settings.'
    });
  }
});

// Routes
app.use('/api/payments', paymentRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/dashboard', dashboardRoutes);

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tuition-aspirasi';

// IP addresses for MongoDB Atlas network access
const allowedIPs = {
  production: '183.171.101.28/32',
  development: '0.0.0.0/0' // Allow all IPs for development
};

// Configure MongoDB connection options for serverless environment
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  bufferCommands: false, // Disable mongoose buffering
  serverSelectionTimeoutMS: 10000, // Keep trying to send operations for 10 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  retryWrites: true,
  w: 'majority',
  maxPoolSize: 10, // Maintain up to 10 socket connections
  minPoolSize: 5 // Maintain at least 5 socket connections
};

// Handle MongoDB connection with better error handling
let cachedConnection = null;

const connectToDatabase = async () => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }
  
  try {
    // Disconnect if there's a stale connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    
    // Connect with a timeout
    const connection = await Promise.race([
      mongoose.connect(MONGO_URI, mongooseOptions),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('MongoDB connection timeout')), 15000)
      )
    ]);
    
    console.log('MongoDB connected successfully');
    cachedConnection = connection;
    return connection;
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
};

// Basic route for testing
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to Tuition Centre Aspirasi Murni API', registrationNumber: 'JZ2C113' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Export the Express app as a serverless function
module.exports = app;