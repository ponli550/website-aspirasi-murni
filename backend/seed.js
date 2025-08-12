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
    recordedName: 'Ahmad',
    contactNumber: '012-3456789',
    email: 'ahmad@example.com'
  },
  {
    name: 'Siti Binti Mohamed',
    recordedName: 'Siti',
    contactNumber: '013-4567890',
    email: 'siti@example.com'
  },
  {
    name: 'Raj Kumar',
    recordedName: 'Raj',
    contactNumber: '014-5678901',
    email: 'raj@example.com'
  },
  {
    name: 'Li Wei',
    recordedName: 'Wei',
    contactNumber: '015-6789012',
    email: 'liwei@example.com'
  },
  {
    name: 'Nurul Huda',
    recordedName: 'Nurul',
    contactNumber: '016-7890123',
    email: 'nurul@example.com'
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

// Payment methods
const paymentMethods = ['Cash', 'Bank Transfer', 'Credit Card', 'Debit Card', 'Online Payment', 'Other'];

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
          student: student._id,
          amount,
          paymentMethod,
          paymentDate: paymentDate,
          description: `Tuition fee for ${paymentDate.toLocaleString('default', { month: 'long' })}`,
          receiptNumber: `R${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
          month: paymentDate.toLocaleString('default', { month: 'long' }),
          year: paymentDate.getFullYear()
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