module.exports = (req, res) => {
  // Return basic information about the environment
  return res.status(200).json({
    message: 'Simple test endpoint is working',
    node_version: process.version,
    env_vars_available: Object.keys(process.env).filter(key => 
      !key.includes('KEY') && 
      !key.includes('SECRET') && 
      !key.includes('PASSWORD')
    ),
    has_mongo_uri: !!process.env.MONGO_URI,
    mongo_uri_prefix: process.env.MONGO_URI ? process.env.MONGO_URI.substring(0, 20) + '...' : 'Not available'
  });
};