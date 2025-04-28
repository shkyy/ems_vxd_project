'use client';

import { useAuth } from "@/context/AuthContext";
import { empApi, leaveAPI } from "@/services/api";
import { Employee, Leave } from "@/types";
import { Alert, Box, Button, Chip, CircularProgress, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, Grid, InputLabel, MenuItem, Paper, Select, SelectChangeEvent, Snackbar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

interface LeaveFormData {
    employeeId: number;
    startDate: Date | null;
    endDate: Date | null;
    leaveType: string;
    reason: string;
}

export default function LeavePage() {
    const { user } = useAuth();
    const [leaves, setLeaves] = useState<Leave[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEmployee, setSelectedEmployee] = useState<string>('');
    const [selectedStatus, setSelectedStatus] = useState<string>('');
    const [showApplyForm, setShowApplyForm] = useState(false);
    const [formData, setFormData] = useState({
        employeeId: 0,
        startDate: null,
        endDate: null,
        leaveType: 'ANNUAL',
        reason: ''
    });
    const [mesasage, setMessage] = useState({ type: '', text: '' });
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState({
        open: false,
        title: '', 
        message: '',
        action: '', 
        leaveId: 0
    });

    const fetchedData = async () => {
        try {
            setLoading(true);

            //fetch employees
            const emps = await empApi.getAll();
            setEmployees(emps);

            //set current users employee id if available
            setFormData(prev => ({
                ...prev,
                employeeId: user?.employee?.employeeId || 0
            }));

            // fetch leaves on based on filters
            let leaveData: any[] | ((prevState: Leave[]) => Leave[]);
            if (selectedStatus) {
                leaveData = await leaveAPI.getByStatus(selectedStatus);
            } else if (selectedEmployee) {
                leaveData = await leaveAPI.getByEmployee(parseInt(selectedEmployee));

            } else if (user?.role === 'USER' && user?.employee?.employeeId) {
                // default to show current employee's leaves if they're an employee
                leaveData = await leaveAPI.getByEmployee(user.employee.employeeId);
                setSelectedEmployee(user.employee.employeeId.toString());
            } else {
                // for admins, show all leaves through employee API
                const allEmployees = await empApi.getAll();
                leaveData = [];

                for (const emp of allEmployees) {
                const empLeaves = await leaveAPI.getByEmployee(emp.employeeId);
                leaveData = [...leaveData, ...empLeaves];
                }
            }
            
            setLeaves(leaveData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching leave data:', error);
            setLoading(false);
        }

    };

    useEffect(() => {
        fetchedData();
    }, [selectedStatus, selectedEmployee]);

    const handleEmployeeChange = (e: SelectChangeEvent) => {
        setSelectedEmployee(e.target.value);
    };

    const handleStatusChange = (e: SelectChangeEvent) => {
        setSelectedStatus(e.target.value);
    };

    const handleFormChange = (field: keyof LeaveFormData, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmitLeave = async () => {
        try {
          if (!formData.employeeId || !formData.startDate || !formData.endDate || !formData.leaveType || !formData.reason) {
            setMessage({ type: 'error', text: 'Please fill all required fields' });
            setSnackbarOpen(true);
            return;
          }
    
          // calculate total days difference between start and end date
          const startDate = new Date(formData.startDate as Date);
          const endDate = new Date(formData.endDate as Date);
          const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Add 1 to include both start and end days
    
          const leaveRequest = {
            employeeId: formData.employeeId,
            startDate: (formData.startDate as Date).toISOString().split('T')[0],
            endDate: (formData.endDate as Date).toISOString().split('T')[0],
            totaldays: diffDays,
            leaveType: formData.leaveType,
            reason: formData.reason,
            status: 'PENDING'
          };
    
          await leaveAPI.apply(leaveRequest);
          setMessage({ type: 'success', text: 'Leave request submitted successfully' });
          setSnackbarOpen(true);
          setShowApplyForm(false);
          fetchedData();
        } catch (error) {
          console.error("Error submitting leave request:", error);
          setMessage({ type: 'error', text: 'Failed to submit leave request' });
          setSnackbarOpen(true);
        }
      };
    
      const handleApproveReject = async (action: 'approve' | 'reject') => {
        try {
          const { leaveId } = confirmDialog;
          
          if (action === 'approve') {
            await leaveAPI.approve(leaveId, user?.employee?.employeeId || 0);
            setMessage({ type: 'success', text: 'Leave request approved successfully' });
          } else {
            await leaveAPI.reject(leaveId, user?.employee?.employeeId || 0);
            setMessage({ type: 'success', text: 'Leave request rejected successfully' });
          }
          
          setSnackbarOpen(true);
          setConfirmDialog({ ...confirmDialog, open: false });
          fetchedData();
        } catch (error) {
          console.error(`Error ${confirmDialog.action} leave request:`, error);
          setMessage({ type: 'error', text: `Failed to ${confirmDialog.action} leave request` });
          setSnackbarOpen(true);
        }
      };
    
      const handleCancelLeave = async () => {
        try {
          const { leaveId } = confirmDialog;
          await leaveAPI.cancel(leaveId);
          setMessage({ type: 'success', text: 'Leave request cancelled successfully' });
          setSnackbarOpen(true);
          setConfirmDialog({ ...confirmDialog, open: false });
          fetchedData();
        } catch (error) {
          console.error("Error cancelling leave request:", error);
          setMessage({ type: 'error', text: 'Failed to cancel leave request' });
          setSnackbarOpen(true);
        }
      };
    
      const openConfirmDialog = (action: string, leaveId: number) => {
        let title = '';
        let message = '';
        
        if (action === 'approve') {
          title = 'Approve Leave Request';
          message = 'Are you sure you want to approve this leave request?';
        } else if (action === 'reject') {
          title = 'Reject Leave Request';
          message = 'Are you sure you want to reject this leave request?';
        } else if (action === 'cancel') {
          title = 'Cancel Leave Request';
          message = 'Are you sure you want to cancel this leave request?';
        }
        
        setConfirmDialog({
          open: true,
          title,
          message,
          action,
          leaveId
        });
      };
    
      const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
      };
    
      const getStatusChipColor = (status: string) => {
        switch (status) {
          case 'APPROVED':
            return 'success';
          case 'REJECTED':
            return 'error';
          case 'CANCELLED':
            return 'default';
          default:
            return 'warning';
        }
      };
    
      const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
      };

      return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h4" component="h1" fontWeight="600">
                Leave Management
              </Typography>
              <Button 
                onClick={() => setShowApplyForm(!showApplyForm)}
                variant="contained"
                color="primary"
              >
                {showApplyForm ? 'Cancel' : 'Apply for Leave'}
              </Button>
            </Box>
    
            <Snackbar 
              open={snackbarOpen} 
              autoHideDuration={6000} 
              onClose={handleCloseSnackbar}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
              <Alert 
                onClose={handleCloseSnackbar} 
                severity={mesasage.type === 'success' ? 'success' : 'error'} 
                sx={{ width: '100%' }}
              >
                {mesasage.text}
              </Alert>
            </Snackbar>
    
            {/* apply Leave Form */}
            {showApplyForm && (
              <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Apply for Leave
                </Typography>
                <Grid container spacing={3}>
                  {(user?.role === 'ADMIN' || user?.role === 'HR') && (
                    <Grid sx={{xs: 12, md: 6}}>
                      <FormControl fullWidth>
                        <InputLabel id="employee-select-label">Employee</InputLabel>
                        <Select
                          labelId="employee-select-label"
                          id="employee-select"
                          value={formData.employeeId ? formData.employeeId.toString() : ''}
                          label="Employee"
                          onChange={(e) => handleFormChange('employeeId', parseInt(e.target.value))}
                        >
                          <MenuItem value="">
                            <em>Select Employee</em>
                          </MenuItem>
                          {employees.map((emp) => (
                            <MenuItem key={emp.employeeId} value={emp.employeeId.toString()}>
                              {emp.firstName} {emp.lastName}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                  <Grid sx={{xs: 12, md: user?.role === 'EMPLOYEE' ? 6 : 3}}>
                    <DatePicker
                      label="Start Date"
                      value={formData.startDate}
                      onChange={(newValue) => handleFormChange('startDate', newValue)}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </Grid>
                  <Grid sx={{xs: 12, md: user?.role === 'EMPLOYEE' ? 6 : 3}}>
                    <DatePicker
                      label="End Date"
                      value={formData.endDate}
                      onChange={(newValue) => handleFormChange('endDate', newValue)}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </Grid>
                  <Grid sx={{xs: 12, md: 6}}>
                    <FormControl fullWidth>
                      <InputLabel id="leave-type-label">Leave Type</InputLabel>
                      <Select
                        labelId="leave-type-label"
                        id="leave-type"
                        value={formData.leaveType}
                        label="Leave Type"
                        onChange={(e) => handleFormChange('leaveType', e.target.value)}
                      >
                        <MenuItem value="ANNUAL">Annual Leave</MenuItem>
                        <MenuItem value="SICK">Sick Leave</MenuItem>
                        <MenuItem value="MATERNITY">Maternity Leave</MenuItem>
                        <MenuItem value="PATERNITY">Paternity Leave</MenuItem>
                        <MenuItem value="PERSONAL">Personal Leave</MenuItem>
                        <MenuItem value="UNPAID">Unpaid Leave</MenuItem>
                        <MenuItem value="OTHER">Other</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid sx={{xs: 12, md: 6}}>
                    <TextField
                      id="leave-reason"
                      label="Reason"
                      fullWidth
                      multiline
                      rows={2}
                      value={formData.reason}
                      onChange={(e) => handleFormChange('reason', e.target.value)}
                    />
                  </Grid>
                </Grid>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmitLeave}
                  >
                    Submit
                  </Button>
                </Box>
              </Paper>
            )}
    
            {/* filters */}
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <Grid container spacing={3}>
                {(user?.role === 'ADMIN' || user?.role === 'HR' || user?.role === 'MANAGER') && (
                  <Grid sx={{xs: 12, md: 6}}>
                    <FormControl fullWidth>
                      <InputLabel id="filter-employee-label">Employee</InputLabel>
                      <Select
                        labelId="filter-employee-label"
                        id="filter-employee"
                        value={selectedEmployee}
                        label="Employee"
                        onChange={handleEmployeeChange}
                      >
                        <MenuItem value="">All Employees</MenuItem>
                        {employees.map((emp) => (
                          <MenuItem key={emp.employeeId} value={emp.employeeId.toString()}>
                            {emp.firstName} {emp.lastName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                )}
                <Grid sx={{ xs: 1, md: user?.role === 'ADMIN' ? 6 : 12} }>
                <FormControl fullWidth>
                    <Select
                      labelId="filter-status-label"
                      id="filter-status"
                      value={selectedStatus}
                      label="Status"
                      onChange={handleStatusChange}
                    >
                      <MenuItem value="">All Statuses</MenuItem>
                      <MenuItem value="PENDING">Pending</MenuItem>
                      <MenuItem value="APPROVED">Approved</MenuItem>
                      <MenuItem value="REJECTED">Rejected</MenuItem>
                      <MenuItem value="CANCELLED">Cancelled</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>
    
            {/* leave Requests Table */}
            <Paper elevation={3}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                  <CircularProgress />
                </Box>
              ) : leaves.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="textSecondary">
                    No leave requests found for the selected criteria
                  </Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Employee</TableCell>
                        <TableCell>Leave Type</TableCell>
                        <TableCell>Start Date</TableCell>
                        <TableCell>End Date</TableCell>
                        <TableCell>Duration</TableCell>
                        <TableCell>Reason</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {leaves.map((leave) => (
                        <TableRow key={leave.leave_id}>
                          <TableCell>
                            {`${leave.employee.firstName} ${leave.employee.lastName}`}
                          </TableCell>
                          <TableCell>{leave.leaveType}</TableCell>
                          <TableCell>{formatDate(leave.startDate)}</TableCell>
                          <TableCell>{formatDate(leave.endDate)}</TableCell>
                          <TableCell>{leave.totaldays} days</TableCell>
                          <TableCell>{leave.reason}</TableCell>
                          <TableCell>
                            <Chip 
                              label={leave.status} 
                              color={getStatusChipColor(leave.status) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {leave.status === 'PENDING' && (
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                {/* For employees - can cancel their own requests */}
                                {user?.employee?.employeeId === leave.employee.employeeId && (
                                  <Button 
                                    size="small" 
                                    variant="outlined" 
                                    color="error"
                                    onClick={() => openConfirmDialog('cancel', leave.leave_id)}
                                  >
                                    Cancel
                                  </Button>
                                )}
                                
                                {/* For managers/HR/admin - can approve/reject */}
                                {(user?.role === 'ADMIN' || user?.role === 'HR' || 
                                  (user?.role === 'MANAGER' && user?.employee?.employeeId !== leave.employee.employeeId)) && (
                                  <>
                                    <Button 
                                      size="small" 
                                      variant="outlined" 
                                      color="success"
                                      onClick={() => openConfirmDialog('approve', leave.leave_id)}
                                    >
                                      Approve
                                    </Button>
                                    <Button 
                                      size="small" 
                                      variant="outlined" 
                                      color="error"
                                      onClick={() => openConfirmDialog('reject', leave.leave_id)}
                                    >
                                      Reject
                                    </Button>
                                  </>
                                )}
                              </Box>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
    
            {/* Confirmation Dialog */}
            <Dialog
              open={confirmDialog.open}
              onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
            >
              <DialogTitle>{confirmDialog.title}</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  {confirmDialog.message}
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    if (confirmDialog.action === 'approve') {
                      handleApproveReject('approve');
                    } else if (confirmDialog.action === 'reject') {
                      handleApproveReject('reject');
                    } else if (confirmDialog.action === 'cancel') {
                      handleCancelLeave();
                    }
                  }} 
                  autoFocus
                  color={confirmDialog.action === 'approve' ? 'success' : 'error'}
                >
                  {confirmDialog.action === 'approve' ? 'Approve' : 
                   confirmDialog.action === 'reject' ? 'Reject' : 'Cancel Leave'}
                </Button>
              </DialogActions>
            </Dialog>
          </Container>
        </LocalizationProvider>
          
      );

}