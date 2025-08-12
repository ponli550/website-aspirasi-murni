import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Divider,
  Tooltip
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { getStudent, getPaymentsByStudent } from '../services/api';

const StudentPayments = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [studentId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentData, paymentsData] = await Promise.all([
        getStudent(studentId),
        getPaymentsByStudent(studentId)
      ]);
      setStudent(studentData);
      setPayments(paymentsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayment = () => {
    navigate('/payments', { state: { addPayment: true, studentId } });
  };

  const handleEditPayment = (paymentId) => {
    navigate('/payments', { state: { editPayment: true, paymentId } });
  };

  const handleDeletePayment = (paymentId) => {
    navigate('/payments', { state: { deletePayment: true, paymentId } });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const calculateTotal = () => {
    return payments.reduce((sum, payment) => sum + payment.amount, 0);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/students')}
          sx={{ mb: 3 }}
        >
          Back to Students
        </Button>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/students')}
        sx={{ mb: 3 }}
      >
        Back to Students
      </Button>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {student?.name}'s Payments
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          {student?.email || 'No email provided'} | {student?.contactNumber || 'No contact number provided'}
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Total Payments</Typography>
              <Typography variant="h3" color="primary">RM {calculateTotal().toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Number of Payments</Typography>
              <Typography variant="h3" color="secondary">{payments.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Average Payment</Typography>
              <Typography variant="h3" color="info.main">
                RM {payments.length > 0 ? (calculateTotal() / payments.length).toFixed(2) : '0.00'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Payment History</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddPayment}
        >
          Add Payment
        </Button>
      </Box>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Amount (RM)</TableCell>
                <TableCell>Payment Method</TableCell>
                <TableCell>Receipt #</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.length > 0 ? (
                payments.map((payment) => (
                  <TableRow key={payment._id}>
                    <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                    <TableCell>{payment.amount.toFixed(2)}</TableCell>
                    <TableCell>{payment.paymentMethod}</TableCell>
                    <TableCell>{payment.receiptNumber || '-'}</TableCell>
                    <TableCell>{payment.description || '-'}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit Payment">
                        <IconButton
                          color="info"
                          onClick={() => handleEditPayment(payment._id)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Payment">
                        <IconButton
                          color="error"
                          onClick={() => handleDeletePayment(payment._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No payment records found for this student.
                  </TableCell>
                </TableRow>
              )}
              {payments.length > 0 && (
                <TableRow>
                  <TableCell colSpan={1} sx={{ fontWeight: 'bold' }}>Total</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>RM {calculateTotal().toFixed(2)}</TableCell>
                  <TableCell colSpan={4}></TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>Payment Summary by Month</Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          {Object.entries(
            payments.reduce((acc, payment) => {
              const date = new Date(payment.paymentDate);
              const monthYear = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
              
              if (!acc[monthYear]) {
                acc[monthYear] = {
                  total: 0,
                  count: 0
                };
              }
              
              acc[monthYear].total += payment.amount;
              acc[monthYear].count += 1;
              
              return acc;
            }, {})
          ).map(([monthYear, data]) => (
            <Grid item xs={12} sm={6} md={4} key={monthYear}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6">{monthYear}</Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {data.count} payment{data.count !== 1 ? 's' : ''}
                  </Typography>
                  <Typography variant="h5" color="primary">
                    RM {data.total.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default StudentPayments;