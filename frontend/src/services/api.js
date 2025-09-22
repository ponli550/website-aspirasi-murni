import axios from 'axios';

// Updated to use your deployed backend URL + /api endpoint
const API_URL = 'https://website-aspirasi-murni-2f7yllsue-ponli550s-projects.vercel.app/';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Student API calls
export const getStudents = async () => {
  try {
    const response = await api.get('/api/students');
    return response.data;
  } catch (error) {
    console.error('Error fetching students:', error);
    throw error;
  }
};

export const getStudent = async (id) => {
  try {
    const response = await api.get(`/api/students/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching student ${id}:`, error);
    throw error;
  }
};

export const createStudent = async (studentData) => {
  try {
    const response = await api.post('/api/students', studentData);
    return response.data;
  } catch (error) {
    console.error('Error creating student:', error);
    throw error;
  }
};

export const updateStudent = async (id, studentData) => {
  try {
    const response = await api.patch(`/api/students/${id}`, studentData);
    return response.data;
  } catch (error) {
    console.error(`Error updating student ${id}:`, error);
    throw error;
  }
};

export const deleteStudent = async (id) => {
  try {
    const response = await api.delete(`/api/students/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting student ${id}:`, error);
    throw error;
  }
};

// Payment API calls
export const getPayments = async () => {
  try {
    const response = await api.get('/api/payments');
    return response.data;
  } catch (error) {
    console.error('Error fetching payments:', error);
    throw error;
  }
};

export const getPaymentsByStudent = async (studentId) => {
  try {
    const response = await api.get(`/api/payments/student/${studentId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching payments for student ${studentId}:`, error);
    throw error;
  }
};

export const getPaymentsByMonth = async (month, year) => {
  try {
    const response = await api.get(`/api/payments/month/${month}/year/${year}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching payments for ${month} ${year}:`, error);
    throw error;
  }
};

export const getPayment = async (id) => {
  try {
    const response = await api.get(`/api/payments/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching payment ${id}:`, error);
    throw error;
  }
};

export const createPayment = async (paymentData) => {
  try {
    const response = await api.post('/api/payments', paymentData);
    return response.data;
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
};

export const updatePayment = async (id, paymentData) => {
  try {
    const response = await api.patch(`/api/payments/${id}`, paymentData);
    return response.data;
  } catch (error) {
    console.error(`Error updating payment ${id}:`, error);
    throw error;
  }
};

export const deletePayment = async (id) => {
  try {
    const response = await api.delete(`/api/payments/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting payment ${id}:`, error);
    throw error;
  }
};

// Dashboard API calls
export const getDashboardSummary = async () => {
  try {
    const response = await api.get('/api/dashboard/summary');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    throw error;
  }
};

export const getStudentSummaries = async () => {
  try {
    const response = await api.get('/api/dashboard/student-summaries');
    return response.data;
  } catch (error) {
    console.error('Error fetching student summaries:', error);
    throw error;
  }
};

export const getMonthlyReport = async (month, year) => {
  try {
    const response = await api.get(`/api/dashboard/monthly-report/${month}/${year}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching monthly report for ${month} ${year}:`, error);
    throw error;
  }
};

// E-Invoice export
export const exportEInvoice = async (format, filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add filters to query parameters
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        queryParams.append(key, filters[key]);
      }
    });
    
    const queryString = queryParams.toString();
    // Update this line to include 'einvoice' in the path
    const url = `/api/payments/export/einvoice/${format}${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get(url, {
      responseType: 'blob'
    });
    
    // Create blob link to download
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    
    // Set filename based on format
    const timestamp = new Date().toISOString().split('T')[0];
    link.download = `payments_export_${timestamp}.${format}`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
    
    return { success: true, message: 'Export completed successfully' };
  } catch (error) {
    console.error(`Error exporting ${format}:`, error);
    throw error;
  }
};

export default api;