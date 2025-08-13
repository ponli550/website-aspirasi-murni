const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Student = require('../models/Student');

// Get dashboard summary data
router.get('/summary', async (req, res) => {
  try {
    // Get total students count
    const totalStudents = await Student.countDocuments();

    // Get total payments amount
    const totalPaymentsResult = await Payment.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);
    const totalPayments = totalPaymentsResult.length > 0 ? totalPaymentsResult[0].total : 0;

    // Get current month payments
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
    const currentYear = currentDate.getFullYear();

    const currentMonthPaymentsResult = await Payment.aggregate([
      {
        $match: {
          month: currentMonth,
          year: currentYear
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);
    const currentMonthPayments = currentMonthPaymentsResult.length > 0 ? currentMonthPaymentsResult[0].total : 0;

    // Get payment methods distribution
    const paymentMethodsDistribution = await Payment.aggregate([
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get monthly payments for the current year
    const monthlyPaymentsRaw = await Payment.aggregate([
      {
        $match: {
          year: currentYear
        }
      },
      {
        $group: {
          _id: '$month',
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Convert numeric months to month names
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const monthlyPayments = monthlyPaymentsRaw.map(item => ({
      _id: monthNames[item._id - 1], // Convert 1-12 to month names
      total: item.total
    }));

    res.json({
      totalStudents,
      totalPayments,
      currentMonthPayments,
      paymentMethodsDistribution,
      monthlyPayments,
      currentMonth,
      currentYear
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get student payment summaries
router.get('/student-summaries', async (req, res) => {
  try {
    const studentSummaries = await Payment.aggregate([
      {
        $group: {
          _id: '$student',
          totalPaid: { $sum: '$amount' },
          paymentCount: { $sum: 1 },
          lastPaymentDate: { $max: '$paymentDate' }
        }
      },
      {
        $sort: { lastPaymentDate: -1 }
      }
    ]);

    // Populate student details
    const populatedSummaries = await Student.populate(studentSummaries, {
      path: '_id',
      select: 'name recordedName'
    });

    res.json(populatedSummaries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get monthly report
router.get('/monthly-report/:month/:year', async (req, res) => {
  try {
    const { month, year } = req.params;
    
    // Convert month name to number if needed
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    let monthNumber;
    if (isNaN(month)) {
      // Month is a name, convert to number
      monthNumber = monthNames.indexOf(month) + 1;
      if (monthNumber === 0) {
        return res.status(400).json({ message: 'Invalid month name' });
      }
    } else {
      // Month is already a number
      monthNumber = parseInt(month);
    }
    
    // Get all payments for the specified month and year
    const payments = await Payment.find({
      month: monthNumber,
      year: parseInt(year)
    }).populate('studentId', 'name').sort({ paymentDate: 1 });

    // Calculate total amount
    const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);

    // Group by payment method
    const paymentMethodSummary = await Payment.aggregate([
      {
        $match: {
          month: monthNumber,
          year: parseInt(year)
        }
      },
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
    ]);

    res.json({
      month,
      year: parseInt(year),
      totalAmount,
      paymentCount: payments.length,
      payments,
      paymentMethodSummary
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;