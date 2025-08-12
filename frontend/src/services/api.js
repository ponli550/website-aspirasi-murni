import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Student API calls
export const getStudents = async () => {
  try {
    const response = await api.get('/students');
    return response.data;
  } catch (error) {
    console.error('Error fetching students:', error);
    throw error;
  }
};

export const getStudent = async (id) => {
  try {
    const response = await api.get(`/students/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching student ${id}:`, error);
    throw error;
  }
};

export const createStudent = async (studentData) => {
  try {
    const response = await api.post('/students', studentData);
    return response.data;
  } catch (error) {
    console.error('Error creating student:', error);
    throw error;
  }
};

export const updateStudent = async (id, studentData) => {
  try {
    const response = await api.patch(`/students/${id}`, studentData);
    return response.data;
  } catch (error) {
    console.error(`Error updating student ${id}:`, error);
    throw error;
  }
};

export const deleteStudent = async (id) => {
  try {
    const response = await api.delete(`/students/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting student ${id}:`, error);
    throw error;
  }
};

// Payment API calls
export const getPayments = async () => {
  try {
    const response = await api.get('/payments');
    return response.data;
  } catch (error) {
    console.error('Error fetching payments:', error);
    throw error;
  }
};

export const getPaymentsByStudent = async (studentId) => {
  try {
    const response = await api.get(`/payments/student/${studentId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching payments for student ${studentId}:`, error);
    throw error;
  }
};

export const getPaymentsByMonth = async (month, year) => {
  try {
    const response = await api.get(`/payments/month/${month}/year/${year}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching payments for ${month} ${year}:`, error);
    throw error;
  }
};

export const getPayment = async (id) => {
  try {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching payment ${id}:`, error);
    throw error;
  }
};

export const createPayment = async (paymentData) => {
  try {
    const response = await api.post('/payments', paymentData);
    return response.data;
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
};

export const updatePayment = async (id, paymentData) => {
  try {
    const response = await api.patch(`/payments/${id}`, paymentData);
    return response.data;
  } catch (error) {
    console.error(`Error updating payment ${id}:`, error);
    throw error;
  }
};

export const deletePayment = async (id) => {
  try {
    const response = await api.delete(`/payments/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting payment ${id}:`, error);
    throw error;
  }
};

// Dashboard API calls
export const getDashboardSummary = async () => {
  try {
    const response = await api.get('/dashboard/summary');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    throw error;
  }
};

export const getStudentSummaries = async () => {
  try {
    const response = await api.get('/dashboard/student-summaries');
    return response.data;
  } catch (error) {
    console.error('Error fetching student summaries:', error);
    throw error;
  }
};

export const getMonthlyReport = async (month, year) => {
  try {
    const response = await api.get(`/dashboard/monthly-report/${month}/${year}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching monthly report for ${month} ${year}:`, error);
    throw error;
  }
};

// Export e-invoice
export const exportEInvoice = async (format, filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.month) params.append('month', filters.month);
    if (filters.year) params.append('year', filters.year);
    if (filters.studentId) params.append('studentId', filters.studentId);
    
    const endpoint = format === 'pdf' 
      ? `/payments/export/einvoice/pdf?${params.toString()}`
      : `/payments/export/einvoice/${format}?${params.toString()}`;
    
    const response = await api.get(endpoint, {
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // Get filename from response headers or create default
    const contentDisposition = response.headers['content-disposition'];
    let filename = `einvoice-${Date.now()}.${format}`;
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/); 
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }
    
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { success: true, filename };
  } catch (error) {
    console.error(`Error exporting e-invoice as ${format}:`, error);
    throw error;
  }
};

export default api;