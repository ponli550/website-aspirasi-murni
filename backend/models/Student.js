const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    zipCode: { type: String, default: '' },
    country: { type: String, default: 'Malaysia' }
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  enrollmentDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  grade: {
    type: String,
    required: true
  },
  subjects: [{
    type: String,
    required: true
  }],
  monthlyFee: {
    type: Number,
    required: true,
    min: 0
  },
  parentName: {
    type: String,
    required: true,
    trim: true
  },
  parentPhone: {
    type: String,
    required: true,
    trim: true
  },
  parentEmail: {
    type: String,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'graduated', 'withdrawn'],
    default: 'active'
  },
  notes: {
    type: String,
    default: ''
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
studentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for student's age
studentSchema.virtual('age').get(function() {
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Virtual for full address
studentSchema.virtual('fullAddress').get(function() {
  const { street, city, state, zipCode, country } = this.address;
  return [street, city, state, zipCode, country].filter(Boolean).join(', ');
});

// Ensure virtual fields are serialized
studentSchema.set('toJSON', { virtuals: true });
studentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Student', studentSchema);