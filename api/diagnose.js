// Simple diagnostic endpoint without mongoose
module.exports = (req, res) => {
  // Get MongoDB URI from environment
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tuition-aspirasi';
  
  // Prepare response object with basic environment info
  const diagnosticInfo = {
    timestamp: new Date().toISOString(),
    node_version: process.version,
    environment: process.env.NODE_ENV || 'development',
    vercel_environment: process.env.VERCEL_ENV,
    vercel_region: process.env.VERCEL_REGION,
    has_mongo_uri: !!MONGO_URI,
    mongo_uri_type: typeof MONGO_URI,
    mongo_uri_length: MONGO_URI ? MONGO_URI.length : 0,
    mongo_uri_prefix: MONGO_URI ? `${MONGO_URI.split('://')[0]}://${MONGO_URI.split('://')[1]?.split(':')[0]}:***@` : 'Not available',
    env_vars_available: Object.keys(process.env).filter(key => 
      !key.includes('KEY') && 
      !key.includes('SECRET') && 
      !key.includes('PASSWORD')
    )
  };
  
  // Return diagnostic information
  return res.status(200).json(diagnosticInfo);
};