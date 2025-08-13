const mongoose = require('mongoose');
const Student = require('./models/Student');
const Payment = require('./models/Payment');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected for seeding'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Sample data
const students = [
  {
    name: 'Ahmad Bin Abdullah',
    email: 'ahmad@example.com',
    phone: '012-3456789',
    address: {
      street: '123 Jalan Merdeka',
      city: 'Kuala Lumpur',
      state: 'Selangor',
      zipCode: '50000',
      country: 'Malaysia'
    },
    dateOfBirth: new Date('2010-05-15'),
    enrollmentDate: new Date('2024-01-15'),
    grade: 'Form 1',
    subjects: ['Mathematics', 'Science'],
    monthlyFee: 150,
    parentName: 'Abdullah Ahmad',
    parentPhone: '012-3456788',
    parentEmail: 'abdullah@example.com'
  },
  {
    name: 'Siti Binti Mohamed',
    email: 'siti@example.com',
    phone: '013-4567890',
    address: {
      street: '456 Jalan Bangsar',
      city: 'Kuala Lumpur',
      state: 'Selangor',
      zipCode: '59000',
      country: 'Malaysia'
    },
    dateOfBirth: new Date('2009-08-22'),
    enrollmentDate: new Date('2024-02-01'),
    grade: 'Form 2',
    subjects: ['Mathematics', 'Physics', 'Chemistry'],
    monthlyFee: 200,
    parentName: 'Mohamed Siti',
    parentPhone: '013-4567889',
    parentEmail: 'mohamed@example.com'
  },
  {
    name: 'Raj Kumar',
    email: 'raj@example.com',
    phone: '014-5678901',
    address: {
      street: '789 Jalan Petaling',
      city: 'Kuala Lumpur',
      state: 'Selangor',
      zipCode: '50000',
      country: 'Malaysia'
    },
    dateOfBirth: new Date('2011-03-10'),
    enrollmentDate: new Date('2024-01-20'),
    grade: 'Standard 6',
    subjects: ['Mathematics', 'English'],
    monthlyFee: 120,
    parentName: 'Kumar Raj',
    parentPhone: '014-5678900',
    parentEmail: 'kumar@example.com'
  },
  {
    name: 'Li Wei',
    email: 'liwei@example.com',
    phone: '015-6789012',
    address: {
      street: '321 Jalan Chow Kit',
      city: 'Kuala Lumpur',
      state: 'Selangor',
      zipCode: '50300',
      country: 'Malaysia'
    },
    dateOfBirth: new Date('2010-11-05'),
    enrollmentDate: new Date('2024-03-01'),
    grade: 'Form 1',
    subjects: ['Mathematics', 'Science', 'Chinese'],
    monthlyFee: 180,
    parentName: 'Wei Li',
    parentPhone: '015-6789011',
    parentEmail: 'wei@example.com'
  },
  {
    name: 'Nurul Huda',
    email: 'nurul@example.com',
    phone: '016-7890123',
    address: {
      street: '654 Jalan Ampang',
      city: 'Kuala Lumpur',
      state: 'Selangor',
      zipCode: '50450',
      country: 'Malaysia'
    },
    dateOfBirth: new Date('2008-12-18'),
    enrollmentDate: new Date('2024-01-10'),
    grade: 'Form 3',
    subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology'],
    monthlyFee: 250,
    parentName: 'Huda Nurul',
    parentPhone: '016-7890122',
    parentEmail: 'huda@example.com'
  }
];

// Function to generate a random payment date within the last 12 months
const getRandomDate = () => {
  const now = new Date();
  const monthsAgo = Math.floor(Math.random() * 12);
  const daysAgo = Math.floor(Math.random() * 30);
  now.setMonth(now.getMonth() - monthsAgo);
  now.setDate(now.getDate() - daysAgo);
  return now;
};

// Function to generate a random payment amount between 50 and 200
const getRandomAmount = () => Math.floor(Math.random() * 151) + 50;

// Payment methods (matching enum values in Payment model)
const paymentMethods = ['cash', 'bank_transfer', 'online', 'cheque'];

// Function to get a random payment method
const getRandomPaymentMethod = () => {
  const randomIndex = Math.floor(Math.random() * paymentMethods.length);
  return paymentMethods[randomIndex];
};

// Seed data
const seedData = async () => {
  try {
    // Clear existing data
    await Student.deleteMany({});
    await Payment.deleteMany({});
    
    console.log('Previous data cleared');
    
    // Insert students
    const createdStudents = await Student.insertMany(students);
    console.log(`${createdStudents.length} students inserted`);
    
    // Create payments for each student
    const payments = [];
    
    for (const student of createdStudents) {
      // Generate 1-5 payments per student
      const numPayments = Math.floor(Math.random() * 5) + 1;
      
      for (let i = 0; i < numPayments; i++) {
        const paymentDate = getRandomDate();
        const paymentMethod = getRandomPaymentMethod();
        const amount = getRandomAmount();
        
        payments.push({
          studentId: student._id,
          amount,
          paymentMethod,
          paymentDate: paymentDate,
          description: `Tuition fee for ${paymentDate.toLocaleString('default', { month: 'long' })}`,
          month: paymentDate.getMonth() + 1, // Store as number (1-12)
          year: paymentDate.getFullYear(),
          status: 'completed'
        });
      }
    }
    
    const createdPayments = await Payment.insertMany(payments);
    console.log(`${createdPayments.length} payments inserted`);
    
    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

// Run the seed function
seedData();