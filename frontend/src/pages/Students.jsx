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
  InputAdornment,
  Checkbox
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Payments as PaymentsIcon,
  DeleteSweep as DeleteSweepIcon
} from '@mui/icons-material';
import { getStudents, createStudent, updateStudent, deleteStudent } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    recordedName: '',
    regionalCode: '+60',
    contactNumber: '',
    email: ''
  });

  const regionalCodes = [
    { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
    { code: '+65', country: 'Singapore', flag: '🇸🇬' },
    { code: '+62', country: 'Indonesia', flag: '🇮🇩' },
    { code: '+66', country: 'Thailand', flag: '🇹🇭' },
    { code: '+84', country: 'Vietnam', flag: '🇻🇳' },
    { code: '+63', country: 'Philippines', flag: '🇵🇭' },
    { code: '+1', country: 'USA/Canada', flag: '🇺🇸' },
    { code: '+44', country: 'UK', flag: '🇬🇧' },
    { code: '+86', country: 'China', flag: '🇨🇳' },
    { code: '+91', country: 'India', flag: '🇮🇳' }
  ];
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [openBulkDeleteDialog, setOpenBulkDeleteDialog] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await getStudents();
      setStudents(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to load students. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (student = null) => {
    if (student) {
      setCurrentStudent(student);
      // Parse existing contact number to extract regional code
      let regionalCode = '+60';
      let contactNumber = student.contactNumber || '';
      
      if (contactNumber) {
        const foundCode = regionalCodes.find(rc => contactNumber.startsWith(rc.code));
        if (foundCode) {
          regionalCode = foundCode.code;
          contactNumber = contactNumber.substring(foundCode.code.length).replace(/^[-\s]/, '');
        }
      }
      
      setFormData({
        name: student.name,
        recordedName: student.recordedName || '',
        regionalCode: regionalCode,
        contactNumber: contactNumber,
        email: student.email || ''
      });
    } else {
      setCurrentStudent(null);
      setFormData({
        name: '',
        recordedName: '',
        regionalCode: '+60',
        contactNumber: '',
        email: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleOpenDeleteDialog = (student) => {
    setCurrentStudent(student);
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

  const handleSubmit = async () => {
    try {
      // Combine regional code with contact number
      const submitData = {
        ...formData,
        contactNumber: formData.contactNumber ? `${formData.regionalCode} ${formData.contactNumber}` : ''
      };
      // Remove regionalCode from submit data as it's not a backend field
      delete submitData.regionalCode;
      
      if (currentStudent) {
        // Update existing student
        await updateStudent(currentStudent._id, submitData);
        setSnackbar({
          open: true,
          message: 'Student updated successfully!',
          severity: 'success'
        });
      } else {
        // Create new student
        await createStudent(submitData);
        setSnackbar({
          open: true,
          message: 'Student added successfully!',
          severity: 'success'
        });
      }
      handleCloseDialog();
      fetchStudents();
    } catch (err) {
      console.error('Error saving student:', err);
      setSnackbar({
        open: true,
        message: `Error: ${err.response?.data?.message || 'Failed to save student'}`,
        severity: 'error'
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteStudent(currentStudent._id);
      setSnackbar({
        open: true,
        message: 'Student deleted successfully!',
        severity: 'success'
      });
      handleCloseDeleteDialog();
      fetchStudents();
    } catch (err) {
      console.error('Error deleting student:', err);
      setSnackbar({
        open: true,
        message: `Error: ${err.response?.data?.message || 'Failed to delete student'}`,
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

  const handleViewPayments = (studentId) => {
    navigate(`/student-payments/${studentId}`);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    setSelectedStudents([]); // Clear selections when changing pages
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Bulk selection handlers
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const currentPageStudents = students.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
      setSelectedStudents(currentPageStudents.map(student => student._id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectStudent = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
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
      await Promise.all(selectedStudents.map(studentId => deleteStudent(studentId)));
      setSnackbar({
        open: true,
        message: `${selectedStudents.length} student(s) deleted successfully!`,
        severity: 'success'
      });
      setSelectedStudents([]);
      handleCloseBulkDeleteDialog();
      fetchStudents();
    } catch (err) {
      console.error('Error deleting students:', err);
      setSnackbar({
        open: true,
        message: 'Error deleting some students. Please try again.',
        severity: 'error'
      });
    }
  };

  const isAllSelected = () => {
    const currentPageStudents = students.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    return currentPageStudents.length > 0 && currentPageStudents.every(student => selectedStudents.includes(student._id));
  };

  const isIndeterminate = () => {
    const currentPageStudents = students.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    const selectedCount = currentPageStudents.filter(student => selectedStudents.includes(student._id)).length;
    return selectedCount > 0 && selectedCount < currentPageStudents.length;
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
        <Typography variant="h4">Students</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {selectedStudents.length > 0 && (
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteSweepIcon />}
              onClick={handleOpenBulkDeleteDialog}
            >
              Delete Selected ({selectedStudents.length})
            </Button>
          )}
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Student
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
                  <TableCell>Name</TableCell>
                  <TableCell>Recorded Name</TableCell>
                  <TableCell>Contact Number</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.length > 0 ? (
                  students
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((student) => (
                      <TableRow key={student._id}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedStudents.includes(student._id)}
                            onChange={() => handleSelectStudent(student._id)}
                          />
                        </TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.recordedName || '-'}</TableCell>
                        <TableCell>{student.contactNumber || '-'}</TableCell>
                        <TableCell>{student.email || '-'}</TableCell>
                        <TableCell align="right">
                          <Tooltip title="View Payments">
                            <IconButton
                              color="primary"
                              onClick={() => handleViewPayments(student._id)}
                            >
                              <PaymentsIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Student">
                            <IconButton
                              color="info"
                              onClick={() => handleOpenDialog(student)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Student">
                            <IconButton
                              color="error"
                              onClick={() => handleOpenDeleteDialog(student)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No students found. Add a student to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {students.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={students.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          )}
        </Paper>
      )}

      {/* Add/Edit Student Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{currentStudent ? 'Edit Student' : 'Add New Student'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Student Name"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.name}
              onChange={handleInputChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="recordedName"
              label="Recorded Name (optional)"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.recordedName}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={4}>
                <FormControl fullWidth margin="dense">
                  <InputLabel id="regional-code-label">Region</InputLabel>
                  <Select
                    labelId="regional-code-label"
                    name="regionalCode"
                    value={formData.regionalCode}
                    label="Region"
                    onChange={handleInputChange}
                  >
                    {regionalCodes.map((region) => (
                      <MenuItem key={region.code} value={region.code}>
                        {region.flag} {region.code}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={8}>
                <TextField
                  margin="dense"
                  name="contactNumber"
                  label="Phone Number"
                  type="tel"
                  fullWidth
                  variant="outlined"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  placeholder="123456789"
                  inputProps={{
                    pattern: '[0-9]*',
                    inputMode: 'numeric'
                  }}
                />
              </Grid>
            </Grid>
            <TextField
              margin="dense"
              name="email"
              label="Email Address"
              type="email"
              fullWidth
              variant="outlined"
              value={formData.email}
              onChange={handleInputChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {currentStudent ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {currentStudent?.name}? This action cannot be undone.
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
            Are you sure you want to delete {selectedStudents.length} selected student(s)? This action cannot be undone.
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

export default Students;