import { useState, useEffect } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
  Tooltip,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Checkbox
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Receipt as ReceiptIcon,
  PictureAsPdf as PdfIcon,
  Print as PrintIcon,
  DeleteSweep as DeleteSweepIcon
} from '@mui/icons-material';
import { getPayments, getStudents, createPayment, updatePayment, deletePayment, exportEInvoice } from '../services/api';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentPayment, setCurrentPayment] = useState(null);
  const [formData, setFormData] = useState({
    student: '',
    amount: '',
    paymentMethod: 'Cash',
    paymentDate: new Date(),
    description: '',
    receiptNumber: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedPayments, setSelectedPayments] = useState([]);
  const [openBulkDeleteDialog, setOpenBulkDeleteDialog] = useState(false);

  const descriptionOptions = [
    { value: 'yuran', label: 'Yuran (Tuition Fee)' },
    { value: 'buku', label: 'Buku (Books)' },
    { value: 'peralatan', label: 'Peralatan (Equipment)' },
    { value: 'aktiviti', label: 'Aktiviti (Activities)' },
    { value: 'exam', label: 'Exam Fee' },
    { value: 'pendaftaran', label: 'Pendaftaran (Registration)' },
    { value: 'lain-lain', label: 'Lain-lain (Others)' }
  ];

  const generateReceiptNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `RCP${timestamp}${random}`;
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [paymentsData, studentsData] = await Promise.all([
        getPayments(),
        getStudents()
      ]);
      setPayments(paymentsData);
      setStudents(studentsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (payment = null) => {
    if (payment) {
      setCurrentPayment(payment);
      setFormData({
        student: payment.student._id,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        paymentDate: new Date(payment.paymentDate),
        description: payment.description || '',
        receiptNumber: payment.receiptNumber || ''
      });
    } else {
      setCurrentPayment(null);
      setFormData({
        student: '',
        amount: '',
        paymentMethod: 'Cash',
        paymentDate: new Date(),
        description: 'yuran',
        receiptNumber: generateReceiptNumber()
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleOpenDeleteDialog = (payment) => {
    setCurrentPayment(payment);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleDateChange = (newDate) => {
    setFormData({
      ...formData,
      paymentDate: newDate
    });
  };

  const handleSubmit = async () => {
    try {
      if (currentPayment) {
        // Update existing payment
        await updatePayment(currentPayment._id, formData);
        setSnackbar({
          open: true,
          message: 'Payment updated successfully!',
          severity: 'success'
        });
      } else {
        // Create new payment
        await createPayment(formData);
        setSnackbar({
          open: true,
          message: 'Payment added successfully!',
          severity: 'success'
        });
      }
      handleCloseDialog();
      fetchData();
    } catch (err) {
      console.error('Error saving payment:', err);
      setSnackbar({
        open: true,
        message: `Error: ${err.response?.data?.message || 'Failed to save payment'}`,
        severity: 'error'
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deletePayment(currentPayment._id);
      setSnackbar({
        open: true,
        message: 'Payment deleted successfully!',
        severity: 'success'
      });
      handleCloseDeleteDialog();
      fetchData();
    } catch (err) {
      console.error('Error deleting payment:', err);
      setSnackbar({
        open: true,
        message: `Error: ${err.response?.data?.message || 'Failed to delete payment'}`,
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  const handleGenerateIndividualPDF = async () => {
    if (!currentPayment) {
      setSnackbar({
        open: true,
        message: 'Please save the payment first before generating PDF.',
        severity: 'warning'
      });
      return;
    }

    try {
      const paymentDate = new Date(currentPayment.paymentDate);
      const month = paymentDate.toLocaleString('default', { month: 'long' });
      const year = paymentDate.getFullYear();
      
      const filters = {
        month: month,
        year: year,
        studentId: currentPayment.student._id || currentPayment.student
      };
      
      await exportEInvoice('pdf', filters);
      setSnackbar({
        open: true,
        message: 'Individual payment PDF generated successfully!',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error generating individual PDF:', err);
      setSnackbar({
        open: true,
        message: 'Error generating individual PDF. Please try again.',
        severity: 'error'
      });
    }
  };

  const handlePrintIndividualPDF = async () => {
    if (!currentPayment) {
      setSnackbar({
        open: true,
        message: 'Please save the payment first before printing PDF.',
        severity: 'warning'
      });
      return;
    }

    try {
      const paymentDate = new Date(currentPayment.paymentDate);
      const month = paymentDate.toLocaleString('default', { month: 'long' });
      const year = paymentDate.getFullYear();
      
      const filters = {
        month: month,
        year: year,
        studentId: currentPayment.student._id || currentPayment.student
      };
      
      // Use the existing API service but modify for printing
      const params = new URLSearchParams();
      if (filters.month) params.append('month', filters.month);
      if (filters.year) params.append('year', filters.year);
      if (filters.studentId) params.append('studentId', filters.studentId);
      
      // Use the existing API service for consistency
      const blob = await exportEInvoice(filters);
      
      // Create object URL and open in new window for printing
      const url = window.URL.createObjectURL(blob);
      const printWindow = window.open(url, '_blank');
      
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
      
      setSnackbar({
        open: true,
        message: 'PDF opened for printing!',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error printing individual PDF:', err);
      setSnackbar({
        open: true,
        message: 'Error printing individual PDF. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    setSelectedPayments([]); // Clear selections when changing pages
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Bulk selection handlers
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const currentPagePayments = payments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
      setSelectedPayments(currentPagePayments.map(payment => payment._id));
    } else {
      setSelectedPayments([]);
    }
  };

  const handleSelectPayment = (paymentId) => {
    setSelectedPayments(prev => {
      if (prev.includes(paymentId)) {
        return prev.filter(id => id !== paymentId);
      } else {
        return [...prev, paymentId];
      }
    });
  };

  const handleOpenBulkDeleteDialog = () => {
    setOpenBulkDeleteDialog(true);
  };

  const handleCloseBulkDeleteDialog = () => {
    setOpenBulkDeleteDialog(false);
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedPayments.map(paymentId => deletePayment(paymentId)));
      setSnackbar({
        open: true,
        message: `${selectedPayments.length} payment(s) deleted successfully!`,
        severity: 'success'
      });
      setSelectedPayments([]);
      handleCloseBulkDeleteDialog();
      fetchData();
    } catch (err) {
      console.error('Error deleting payments:', err);
      setSnackbar({
        open: true,
        message: 'Error deleting some payments. Please try again.',
        severity: 'error'
      });
    }
  };

  const isAllSelected = () => {
    const currentPagePayments = payments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    return currentPagePayments.length > 0 && currentPagePayments.every(payment => selectedPayments.includes(payment._id));
  };

  const isIndeterminate = () => {
    const currentPagePayments = payments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    const selectedCount = currentPagePayments.filter(payment => selectedPayments.includes(payment._id)).length;
    return selectedCount > 0 && selectedCount < currentPagePayments.length;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Payments</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {selectedPayments.length > 0 && (
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteSweepIcon />}
              onClick={handleOpenBulkDeleteDialog}
            >
              Delete Selected ({selectedPayments.length})
            </Button>
          )}
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Payment
          </Button>
        </Box>
      </Box>

      {error ? (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      ) : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isAllSelected()}
                      indeterminate={isIndeterminate()}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell>Student</TableCell>
                  <TableCell>Amount (RM)</TableCell>
                  <TableCell>Payment Method</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Receipt #</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.length > 0 ? (
                  payments
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((payment) => (
                      <TableRow key={payment._id}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedPayments.includes(payment._id)}
                            onChange={() => handleSelectPayment(payment._id)}
                          />
                        </TableCell>
                        <TableCell>{payment.student?.name || 'Unknown Student'}</TableCell>
                        <TableCell>{payment.amount.toFixed(2)}</TableCell>
                        <TableCell>{payment.paymentMethod}</TableCell>
                        <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                        <TableCell>{payment.receiptNumber || '-'}</TableCell>
                        <TableCell>{payment.description || '-'}</TableCell>
                        <TableCell align="right">
                          <Tooltip title="Edit Payment">
                            <IconButton
                              color="info"
                              onClick={() => handleOpenDialog(payment)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Payment">
                            <IconButton
                              color="error"
                              onClick={() => handleOpenDeleteDialog(payment)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No payments found. Add a payment to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {payments.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={payments.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          )}
        </Paper>
      )}

      {/* Add/Edit Payment Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{currentPayment ? 'Edit Payment' : 'Add New Payment'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel id="student-label">Student</InputLabel>
                  <Select
                    labelId="student-label"
                    name="student"
                    value={formData.student}
                    label="Student"
                    onChange={handleInputChange}
                  >
                    {students.map((student) => (
                      <MenuItem key={student._id} value={student._id}>
                        {student.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="amount"
                  label="Amount (RM)"
                  type="number"
                  fullWidth
                  variant="outlined"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel id="payment-method-label">Payment Method</InputLabel>
                  <Select
                    labelId="payment-method-label"
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    label="Payment Method"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="Cash">Cash</MenuItem>
                    <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                    <MenuItem value="Credit Card">Credit Card</MenuItem>
                    <MenuItem value="Debit Card">Debit Card</MenuItem>
                    <MenuItem value="Online Payment">Online Payment</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Payment Date"
                    value={formData.paymentDate}
                    onChange={handleDateChange}
                    renderInput={(params) => <TextField {...params} fullWidth required />}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        variant: 'outlined',
                        required: true
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="receiptNumber"
                  label="Receipt Number"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={formData.receiptNumber}
                  InputProps={{
                    readOnly: true,
                  }}
                  helperText="Auto-generated unique receipt number"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel id="description-label">Payment Type</InputLabel>
                  <Select
                    labelId="description-label"
                    name="description"
                    value={formData.description}
                    label="Payment Type"
                    onChange={handleInputChange}
                  >
                    {descriptionOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          {currentPayment && (
            <>
             <Button 
               onClick={handleGenerateIndividualPDF} 
               variant="outlined" 
               color="secondary"
               startIcon={<PdfIcon />}
             >
               Generate PDF
             </Button>
             <Button 
               onClick={handlePrintIndividualPDF} 
               variant="outlined" 
               color="primary"
               startIcon={<PrintIcon />}
             >
               Print
             </Button>
            </>
           )}
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {currentPayment ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this payment of RM {currentPayment?.amount?.toFixed(2)} for {currentPayment?.student?.name}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={openBulkDeleteDialog} onClose={handleCloseBulkDeleteDialog}>
        <DialogTitle>Confirm Bulk Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {selectedPayments.length} selected payment(s)? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBulkDeleteDialog}>Cancel</Button>
          <Button onClick={handleBulkDelete} variant="contained" color="error">
            Delete All
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Payments;