const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');

module.exports = async (req, res) => {
  // Get MongoDB URI from environment
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tuition-aspirasi';
  
  // Prepare response object
  const diagnosticInfo = {
    timestamp: new Date().toISOString(),
    node_version: process.version,
    environment: process.env.NODE_ENV || 'development',
    vercel_environment: process.env.VERCEL_ENV,
    vercel_region: process.env.VERCEL_REGION,
    has_mongo_uri: !!MONGO_URI,
    mongo_uri_prefix: MONGO_URI ? `${MONGO_URI.split('://')[0]}://${MONGO_URI.split('://')[1]?.split(':')[0]}:***@` : 'Not available',
    tests: []
  };
  
  // Test 1: Direct MongoDB connection
  try {
    diagnosticInfo.tests.push({
      name: 'direct_mongodb_connection',
      status: 'started'
    });
    
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000
    };
    
    const client = new MongoClient(MONGO_URI, options);
    await client.connect();
    
    const db = client.db();
    const collections = await db.listCollections().toArray();
    
    diagnosticInfo.tests[0].status = 'success';
    diagnosticInfo.tests[0].db_name = db.databaseName;
    diagnosticInfo.tests[0].collections = collections.map(c => c.name);
    
    await client.close();
  } catch (error) {
    diagnosticInfo.tests[0].status = 'failed';
    diagnosticInfo.tests[0].error = {
      message: error.message,
      name: error.name,
      code: error.code
    };
  }
  
  // Test 2: Mongoose connection
  try {
    diagnosticInfo.tests.push({
      name: 'mongoose_connection',
      status: 'started'
    });
    
    const mongooseOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000
    };
    
    // Disconnect if there's a stale connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    
    await mongoose.connect(MONGO_URI, mongooseOptions);
    
    diagnosticInfo.tests[1].status = 'success';
    diagnosticInfo.tests[1].mongoose_state = mongoose.connection.readyState;
    diagnosticInfo.tests[1].db_name = mongoose.connection.db.databaseName;
    
    await mongoose.disconnect();
  } catch (error) {
    diagnosticInfo.tests[1].status = 'failed';
    diagnosticInfo.tests[1].error = {
      message: error.message,
      name: error.name,
      code: error.code
    };
  }
  
  // Test 3: Try to load Student model
  try {
    diagnosticInfo.tests.push({
      name: 'load_student_model',
      status: 'started'
    });
    
    // Try to dynamically require the Student model
    try {
      const Student = require('../backend/models/Student');
      diagnosticInfo.tests[2].status = 'success';
      diagnosticInfo.tests[2].model_name = Student.modelName;
      diagnosticInfo.tests[2].schema_paths = Object.keys(Student.schema.paths);
    } catch (modelError) {
      diagnosticInfo.tests[2].status = 'failed';
      diagnosticInfo.tests[2].error = {
        message: modelError.message,
        name: modelError.name,
        code: modelError.code,
        stack: modelError.stack
      };
    }
  } catch (error) {
    diagnosticInfo.tests[2].status = 'failed';
    diagnosticInfo.tests[2].error = {
      message: error.message,
      name: error.name,
      code: error.code
    };
  }
  
  return res.status(200).json(diagnosticInfo);
};