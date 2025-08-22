import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Student API calls
export const getStudents = async () => {
  try {
    const response = await api.get('/direct-mongo-students');
    return response.data;
  } catch (error) {
    console.error('Error fetching students:', error);
    throw error;
  }
};

export const getStudent = async (id) => {
  try {
    const response = await api.get(`/direct-mongo-students?id=${id}`);
    const students = response.data;
    return students.find(student => student._id === id) || null;
  } catch (error) {
    console.error(`Error fetching student ${id}:`, error);
    throw error;
  }
};

export const createStudent = async (studentData) => {
  try {
    const response = await api.post('/direct-mongo-students', studentData);
    return response.data;
  } catch (error) {
    console.error('Error creating student:', error);
    throw error;
  }
};

export const updateStudent = async (id, studentData) => {
  try {
    // Since our direct MongoDB API doesn't support PATCH directly,
    // we need to get the student first, then update with a POST
    const currentStudent = await getStudent(id);
    if (!currentStudent) {
      throw new Error(`Student with ID ${id} not found`);
    }
    
    const updatedStudent = { ...currentStudent, ...studentData };
    const response = await api.post('/direct-mongo-students/update', { id, ...updatedStudent });
    return response.data;
  } catch (error) {
    console.error(`Error updating student ${id}:`, error);
    throw error;
  }
};

export const deleteStudent = async (id) => {
  try {
    const response = await api.post('/direct-mongo-students/delete', { id });
    return response.data;
  } catch (error) {
    console.error(`Error deleting student ${id}:`, error);
    throw error;
  }
};

// Payment API calls
export const getPayments = async () => {
  try {
    const response = await api.get('/direct-mongo-payments');
    return response.data;
  } catch (error) {
    console.error('Error fetching payments:', error);
    throw error;
  }
};

export const getPaymentsByStudent = async (studentId) => {
  try {
    const response = await api.get(`/direct-mongo-payments?studentId=${studentId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching payments for student ${studentId}:`, error);
    throw error;
  }
};

export const getPayment = async (id) => {
  try {
    const response = await api.get(`/direct-mongo-payments`);
    const payments = response.data;
    return payments.find(payment => payment._id === id) || null;
  } catch (error) {
    console.error(`Error fetching payment ${id}:`, error);
    throw error;
  }
};

export const createPayment = async (paymentData) => {
  try {
    const response = await api.post('/direct-mongo-payments', paymentData);
    return response.data;
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
};

// Dashboard API calls
export const getDashboardSummary = async () => {
  try {
    const response = await api.get('/direct-mongo-dashboard');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    throw error;
  }
};

export const getStudentSummaries = async () => {
  try {
    // Since we don't have a direct endpoint for student summaries,
    // we'll get all students and calculate summaries on the client side
    const students = await getStudents();
    
    // Create a summary for each student with their payment status
    const payments = await getPayments();
    
    return students.map(student => {
      const studentPayments = payments.filter(p => p.studentId === student._id);
      const totalPaid = studentPayments.reduce((sum, payment) => sum + payment.amount, 0);
      
      return {
        _id: student._id,
        name: student.name,
        grade: student.grade,
        totalPaid,
        lastPayment: studentPayments.length > 0 ? 
          studentPayments.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))[0] : null
      };
    });
  } catch (error) {
    console.error('Error fetching student summaries:', error);
    throw error;
  }
};

export default api;