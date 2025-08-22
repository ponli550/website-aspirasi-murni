const { MongoClient } = require('mongodb');

module.exports = async (req, res) => {
  // Get MongoDB URI from environment
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tuition-aspirasi';
  
  // Configure MongoDB connection options
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 15000
  };
  
  let client = null;
  
  try {
    // Connect directly using MongoClient
    client = new MongoClient(MONGO_URI, options);
    await client.connect();
    
    // Get database
    const db = client.db();
    
    // Get payments collection
    const paymentsCollection = db.collection('payments');
    
    // Handle different HTTP methods
    if (req.method === 'GET') {
      // Check if there's a student ID in the query parameters
      const { studentId } = req.query;
      
      let query = {};
      if (studentId) {
        query.studentId = studentId;
      }
      
      // Get all payments, optionally filtered by student ID
      const payments = await paymentsCollection.find(query).sort({ paymentDate: -1 }).toArray();
      return res.status(200).json(payments);
    } else if (req.method === 'POST') {
      // Create a new payment
      const paymentData = req.body;
      
      // Add payment date if not provided
      if (!paymentData.paymentDate) {
        paymentData.paymentDate = new Date();
      }
      
      const result = await paymentsCollection.insertOne(paymentData);
      return res.status(201).json({ ...paymentData, _id: result.insertedId });
    } else {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      message: 'Server error',
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
    });
  } finally {
    // Close connection
    if (client) {
      await client.close();
    }
  }
};