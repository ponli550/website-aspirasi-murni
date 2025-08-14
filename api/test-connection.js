const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tuition-aspirasi';

// Configure MongoDB connection options for serverless environment
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  bufferCommands: false, // Disable mongoose buffering
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
};

module.exports = async (req, res) => {
  try {
    // Check if we have a MongoDB URI
    if (!MONGO_URI) {
      return res.status(500).json({
        message: 'MongoDB URI is not defined',
        env_vars_available: Object.keys(process.env).filter(key => !key.includes('KEY') && !key.includes('SECRET') && !key.includes('PASSWORD')),
      });
    }
    
    // Try to connect to MongoDB
    const connection = await mongoose.connect(MONGO_URI, mongooseOptions);
    
    // If successful, return success message
    return res.status(200).json({
      message: 'MongoDB connected successfully',
      mongoose_version: mongoose.version,
      connection_state: mongoose.connection.readyState,
      db_name: mongoose.connection.name,
    });
  } catch (error) {
    // If error, return error message
    return res.status(500).json({
      message: 'MongoDB connection error',
      error: error.message,
      stack: error.stack,
      env_vars_available: Object.keys(process.env).filter(key => !key.includes('KEY') && !key.includes('SECRET') && !key.includes('PASSWORD')),
    });
  } finally {
    // Close the connection to avoid memory leaks
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  }
};