const { MongoClient } = require('mongodb');

module.exports = async (req, res) => {
  // Get MongoDB URI from environment
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tuition-aspirasi';
  
  // IP addresses for MongoDB Atlas network access
  const allowedIPs = {
    production: '183.171.101.28/32',
    development: '0.0.0.0/0' // Allow all IPs for development
  };
  
  // Prepare response object
  const diagnosticInfo = {
    timestamp: new Date().toISOString(),
    node_version: process.version,
    environment: process.env.NODE_ENV || 'development',
    vercel_environment: process.env.VERCEL_ENV,
    vercel_region: process.env.VERCEL_REGION,
    allowed_ips: allowedIPs,
    has_mongo_uri: !!MONGO_URI,
    mongo_uri_prefix: MONGO_URI ? `${MONGO_URI.split('://')[0]}://${MONGO_URI.split('://')[1]?.split(':')[0]}:***@` : 'Not available',
    env_vars: Object.keys(process.env).filter(key => !key.includes('TOKEN') && !key.includes('SECRET') && !key.includes('KEY')),
    connection_attempt: 'Not attempted yet'
  };
  
  // Configure MongoDB connection options
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Short timeout for diagnostic purposes
    connectTimeoutMS: 10000
  };
  
  let client = null;
  
  try {
    // Attempt connection using MongoClient directly
    diagnosticInfo.connection_attempt = 'Started';
    
    // Create a new MongoClient
    client = new MongoClient(MONGO_URI, options);
    
    // Connect with timeout
    const connectPromise = client.connect();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout after 5000ms')), 5000)
    );
    
    await Promise.race([connectPromise, timeoutPromise]);
    
    // If we get here, connection was successful
    diagnosticInfo.connection_attempt = 'Successful';
    diagnosticInfo.connection_state = 'Connected';
    
    // Get database info
    const db = client.db();
    diagnosticInfo.db_name = db.databaseName;
    
    // List collections to verify database access
    const collections = await db.listCollections().toArray();
    diagnosticInfo.collections = collections.map(c => c.name);
    
    return res.status(200).json(diagnosticInfo);
  } catch (error) {
    // Connection failed
    diagnosticInfo.connection_attempt = 'Failed';
    diagnosticInfo.connection_error = {
      message: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack
    };
    
    // Add IP-related troubleshooting note if it appears to be a network issue
    if (error.name === 'MongoNetworkError' || error.message.includes('timeout') || error.message.includes('network')) {
      diagnosticInfo.ip_troubleshooting = 'This may be an IP whitelisting issue. Verify that your current IP address is whitelisted in MongoDB Atlas Network Access settings.';
    }
    
    return res.status(500).json(diagnosticInfo);
  } finally {
    // Close connection to avoid resource leaks
    if (client) {
      await client.close();
      diagnosticInfo.cleanup = 'Connection closed';
    }
  }
};