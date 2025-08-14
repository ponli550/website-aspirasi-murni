const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tuition-aspirasi';

console.log('Attempting to connect to MongoDB with URI:', MONGO_URI);

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });