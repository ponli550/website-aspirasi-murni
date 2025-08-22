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
    
    // Get collections
    const studentsCollection = db.collection('students');
    const paymentsCollection = db.collection('payments');
    
    // Get dashboard data
    const dashboardData = {};
    
    // Get student count
    dashboardData.totalStudents = await studentsCollection.countDocuments();
    
    // Get active student count
    dashboardData.activeStudents = await studentsCollection.countDocuments({ status: 'active' });
    
    // Get payment statistics
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    // Start of current month
    const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
    
    // End of current month
    const endOfMonth = new Date(currentYear, currentMonth, 0);
    
    // Get payments for current month
    const currentMonthPayments = await paymentsCollection.find({
      paymentDate: {
        $gte: startOfMonth,
        $lte: endOfMonth
      }
    }).toArray();
    
    // Calculate total payments for current month
    dashboardData.currentMonthPayments = currentMonthPayments.length;
    dashboardData.currentMonthRevenue = currentMonthPayments.reduce((total, payment) => total + (payment.amount || 0), 0);
    
    // Get recent payments (last 5)
    dashboardData.recentPayments = await paymentsCollection.find()
      .sort({ paymentDate: -1 })
      .limit(5)
      .toArray();
    
    // Get recent students (last 5)
    dashboardData.recentStudents = await studentsCollection.find()
      .sort({ enrollmentDate: -1 })
      .limit(5)
      .toArray();
      
    // Get payment methods distribution
    dashboardData.paymentMethodsDistribution = await paymentsCollection.aggregate([
      {
        $group: {
          _id: '$paymentMethod',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { total: -1 }
      }
    ]).toArray();
    
    // Get monthly payments for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyPaymentsData = await paymentsCollection.aggregate([
      {
        $match: {
          paymentDate: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: '$paymentDate' },
            year: { $year: '$paymentDate' }
          },
          total: { $sum: '$amount' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]).toArray();
    
    // Format monthly payments data
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    dashboardData.monthlyPayments = monthlyPaymentsData.map(item => ({
      _id: monthNames[item._id.month - 1],
      total: item.total
    }));
    
    // Add current month and year
    dashboardData.currentMonth = monthNames[currentMonth - 1];
    dashboardData.currentYear = currentYear;
    
    return res.status(200).json(dashboardData);
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