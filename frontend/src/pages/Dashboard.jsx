import { useState, useEffect } from 'react';
import { 
  Typography, 
  Grid, 
  Paper, 
  Box, 
  Card, 
  CardContent, 
  CardHeader,
  Divider,
  CircularProgress
} from '@mui/material';
import { 
  People as PeopleIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon 
} from '@mui/icons-material';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { useApi } from '../context/ApiContext';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard = () => {
  const { api } = useApi();
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState(null);
  const [studentSummaries, setStudentSummaries] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const summary = await api.getDashboardSummary();
        const studentData = await api.getStudentSummaries();
        setSummaryData(summary);
        setStudentSummaries(studentData);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error" variant="h6">{error}</Typography>
      </Box>
    );
  }

  // Prepare chart data
  const paymentMethodsData = {
    labels: summaryData?.paymentMethodsDistribution.map(item => item._id) || [],
    datasets: [
      {
        label: 'Payment Methods',
        data: summaryData?.paymentMethodsDistribution.map(item => item.total) || [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const monthlyPaymentsData = {
    labels: summaryData?.monthlyPayments.map(item => item._id) || [],
    datasets: [
      {
        label: 'Monthly Payments',
        data: summaryData?.monthlyPayments.map(item => item.total) || [],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        {summaryData?.currentMonth} {summaryData?.currentYear} Overview
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }} key="summary-cards-container">
        <Grid item xs={12} sm={6} md={3} key="total-students-card">
          <Card sx={{ backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)', border: '1px solid rgba(0, 0, 0, 0.03)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PeopleIcon sx={{ color: 'primary.main', mr: 1, fontSize: 40 }} />
                <Typography variant="h6">Total Students</Typography>
              </Box>
              <Typography variant="h4">{summaryData?.totalStudents || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3} key="total-payments-card">
          <Card sx={{ backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)', border: '1px solid rgba(0, 0, 0, 0.03)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box 
                  sx={{ 
                    mr: 1, 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    border: '2px solid',
                    borderColor: 'success.main',
                    borderRadius: '50%',
                    backgroundColor: 'success.main'
                  }}
                >
                  <Typography 
                    sx={{ 
                      fontSize: 14, 
                      fontWeight: 'bold', 
                      color: 'white'
                    }}
                  >
                    RM
                  </Typography>
                </Box>
                <Typography variant="h6">Total Payments</Typography>
              </Box>
              <Typography variant="h4">RM {summaryData?.totalPayments?.toFixed(2) || '0.00'}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3} key="current-month-card">
          <Card sx={{ backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)', border: '1px solid rgba(0, 0, 0, 0.03)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarIcon sx={{ color: 'info.main', mr: 1, fontSize: 40 }} />
                <Typography variant="h6">Current Month</Typography>
              </Box>
              <Typography variant="h4">RM {summaryData?.currentMonthPayments?.toFixed(2) || '0.00'}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3} key="avg-payment-card">
          <Card sx={{ backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)', border: '1px solid rgba(0, 0, 0, 0.03)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon sx={{ color: 'warning.main', mr: 1, fontSize: 40 }} />
                <Typography variant="h6">Avg. Payment</Typography>
              </Box>
              <Typography variant="h4">
                RM {summaryData?.totalPayments && studentSummaries.length 
                  ? (summaryData.totalPayments / studentSummaries.length).toFixed(2) 
                  : '0.00'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} key="charts-container">
        <Grid item xs={12} md={6} key="payment-methods-chart">
          <Paper sx={{ p: 2, backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)', border: '1px solid rgba(0, 0, 0, 0.03)' }}>
            <Typography variant="h6" gutterBottom>Payment Methods</Typography>
            <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
              {summaryData?.paymentMethodsDistribution.length > 0 ? (
                <Pie data={paymentMethodsData} options={{ maintainAspectRatio: false }} />
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <Typography variant="body1" color="textSecondary">No payment data available</Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6} key="monthly-payments-chart">
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Monthly Payments ({summaryData?.currentYear})</Typography>
            <Box sx={{ height: 300 }}>
              {summaryData?.monthlyPayments.length > 0 ? (
                <Bar 
                  data={monthlyPaymentsData} 
                  options={{ 
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Amount (RM)'
                        }
                      }
                    }
                  }} 
                />
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <Typography variant="body1" color="textSecondary">No monthly data available</Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Payments */}
      <Paper sx={{ p: 2, mt: 3 }}>
        <Typography variant="h6" gutterBottom>Student Payment Summary</Typography>
        <Divider sx={{ mb: 2 }} />
        {studentSummaries.length > 0 ? (
          <Grid container spacing={2} key="student-summaries-container">
            {studentSummaries.slice(0, 5).map((summary) => (
              <Grid item xs={12} key={summary._id?._id}>
                <Card variant="outlined">
                  <CardContent sx={{ py: 1 }}>
                    <Grid container alignItems="center" key={`${summary._id?._id}-container`}>
                      <Grid item xs={6} md={4} key={`${summary._id?._id}-info`}>
                        <Typography variant="subtitle1">{summary._id?.name || summary._id?.recordedName || 'Unknown Student'}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          Last payment: {new Date(summary.lastPaymentDate).toLocaleDateString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={3} md={4} sx={{ textAlign: 'center' }} key={`${summary._id?._id}-count`}>
                        <Typography variant="body2" color="textSecondary">Payments</Typography>
                        <Typography variant="subtitle1">{summary.paymentCount}</Typography>
                      </Grid>
                      <Grid item xs={3} md={4} sx={{ textAlign: 'right' }} key={`${summary._id?._id}-total`}>
                        <Typography variant="body2" color="textSecondary">Total Paid</Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          RM {summary.totalPaid.toFixed(2)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="body1" color="textSecondary" sx={{ py: 2, textAlign: 'center' }}>
            No student payment data available
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default Dashboard;