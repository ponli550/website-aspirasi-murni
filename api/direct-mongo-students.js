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
    
    // Get students collection
    const studentsCollection = db.collection('students');
    
    // Handle different HTTP methods
    if (req.method === 'GET') {
      // Get all students
      const students = await studentsCollection.find({}).sort({ name: 1 }).toArray();
      return res.status(200).json(students);
    } else if (req.method === 'POST') {
      // Create a new student
      const studentData = req.body;
      
      // Add enrollment date if not provided
      if (!studentData.enrollmentDate) {
        studentData.enrollmentDate = new Date();
      }
      
      const result = await studentsCollection.insertOne(studentData);
      return res.status(201).json({ ...studentData, _id: result.insertedId });
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