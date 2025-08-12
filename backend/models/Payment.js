const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student reference is required']
  },
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0, 'Payment amount cannot be negative']
  },
  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: ['Cash', 'Bank Transfer', 'Credit Card', 'Debit Card', 'Online Payment', 'Other'],
    default: 'Cash'
  },
  paymentDate: {
    type: Date,
    required: [true, 'Payment date is required'],
    default: Date.now
  },
  description: {
    type: String,
    trim: true
  },
  receiptNumber: {
    type: String,
    trim: true
  },
  month: {
    type: String,
    required: [true, 'Month is required']
  },
  year: {
    type: Number,
    required: [true, 'Year is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Virtual for getting month and year from payment date
PaymentSchema.pre('save', function(next) {
  if (this.isModified('paymentDate') || !this.month || !this.year) {
    const date = new Date(this.paymentDate);
    this.month = date.toLocaleString('default', { month: 'long' });
    this.year = date.getFullYear();
  }
  next();
});

module.exports = mongoose.model('Payment', PaymentSchema);