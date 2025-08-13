const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true,
    min: 2020
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'online', 'cheque'],
    default: 'cash'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'completed'
  },
  description: {
    type: String,
    default: ''
  },
  receiptNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
paymentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Generate receipt number if not provided
paymentSchema.pre('save', function(next) {
  if (!this.receiptNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.receiptNumber = `RCP-${year}${month}${day}-${random}`;
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);