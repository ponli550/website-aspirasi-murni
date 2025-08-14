const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tuition-aspirasi';

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ 
    message: 'MongoDB Connection Test API', 
    mongoUri: MONGO_URI.replace(/\/\/(.*)@/, '//***@') // Hide credentials
  });
});

// Test MongoDB connection
app.get('/test-db', async (req, res) => {
  try {
    await mongoose.connect(MONGO_URI);
    res.json({ success: true, message: 'MongoDB connected successfully' });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'MongoDB connection error', 
      error: err.message 
    });
  } finally {
    try {
      await mongoose.disconnect();
    } catch (err) {
      console.error('Error disconnecting from MongoDB:', err);
    }
  }
});

module.exports = app;