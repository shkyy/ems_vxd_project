'use client';

import { useAuth } from "@/context/AuthContext";
import { attAPI, empApi } from "@/services/api";
import { Attendance, Employee } from "@/types";
import { Alert, Box, Button, CircularProgress, Container, FormControl, Grid, InputLabel, MenuItem, Paper, Select, SelectChangeEvent, Snackbar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";

export default function AttendancePage () {
    const { user } = useAuth();
    const [attendances, setAttendances] = useState<Attendance[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [showMarkForm, setShowMarkForm] = useState(false);
    const [markType, setMarkType] = useState<'IN' | 'OUT' | 'ABSENT'>('IN');
    const [message, setMessage] = useState({ type: '', text: ''});
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const fetchedData = async () => {
        try {
            setLoading(true);
            let attendanceData;
            const emps = await empApi.getAll();
            setEmployees(emps);

            if (selectedEmployee) {
                attendanceData = await attAPI.getByEmployee(parseInt(selectedEmployee));
            } else {
                attendanceData = await attAPI.getAll();
            }

            // filter attendances by selected date if date is provided
            if (selectedDate) {
                attendanceData = attendanceData.filter((att: Attendance) => att.date.split('T')[0] === selectedDate);
            }

            setAttendances(attendanceData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching attendance data: ', error);
            setLoading(false);
            setMessage({type: 'error', text: 'Failed to fetch attendance data'});
        }
    }

    useEffect(() => {
        fetchedData();
    }, [selectedDate]);

    const handleEmployeeSelect = (e: SelectChangeEvent) => {
        setSelectedEmployee(e.target.value);
        fetchedData();
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedDate(e.target.value);
    };

    const handleMarkAttendance = async () => {
        if (!selectedEmployee) {
            setMessage({type: 'error', text: 'Please select an employee'});
            setSnackbarOpen(true);
            return;
        }

        const empId = parseInt(selectedEmployee);

        try {
            if (markType === 'IN') {
                await attAPI.clockIn(empId);
                setMessage({type: 'success', text: 'Clock-in recorded successfully'});
            } else if (markType === 'OUT') {
                await attAPI.clockOut(empId);
                setMessage({type: 'success', text: 'Clock-out recorded successfully'});
            } else if (markType === 'ABSENT') {
                await attAPI.markAbsent(empId, selectedDate);
                setMessage({type: 'success', text: 'Absence recorded successfully'});
            }

            // refresh data
            fetchedData();

            // display sucess message
            setSnackbarOpen(true);

            // hide form after successful submission
            setShowMarkForm(false);

        } catch (error) {
            console.error("Error marking attendance: ", error);
            setMessage({type: 'success', text: 'Clock-in recorded successfully'});
            setSnackbarOpen(true);
        }
    }

    const formatTime = (timeString: string) => {
        if (!timeString) return 'N/A';
        const date = new Date(timeString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'});
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    return (
        <Container maxWidth='lg' sx={{ py: 4}}>
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3}}>
                <Typography variant="h4" component='h1' fontWeight='600'>
                    Attendance Management
                </Typography>

                {(user?.role === 'ADMIN' || user?.role === 'HR')} && (
                    <Button onClick={() => setShowMarkForm(!showMarkForm)} variant="contained" color="primary">
                        {showMarkForm ? 'Cancel' : 'Mark Attendance'}
                    </Button>
                )
            </Box>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={message.type === 'success' ? 'success' : 'error'}
                    sx={{ width: '100%' }}
                >
                    {message.text}
                </Alert>
            </Snackbar>


            {/* mark attendance form */}
            {showMarkForm && (
                <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Mark Attendance
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid sx={{ xs: 12, md: 4 }}>
                            <FormControl fullWidth>
                                <InputLabel id="employee-select-label">Employee</InputLabel>
                                <Select
                                    labelId="employee-select-label"
                                    id="employee-select"
                                    value={selectedEmployee}
                                    label="Employee"
                                    onChange={handleEmployeeSelect}
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
                        <Grid sx={{ xs: 12, md: 4 }}>
                            <TextField
                                id="date-picker"
                                label="Date"
                                type="date"
                                fullWidth
                                value={selectedDate}
                                onChange={handleDateChange}
                                slotProps={{
                                    inputLabel: {
                                        shrink: true
                                    }
                                }}
                            />
                        </Grid>
                        <Grid sx={{ xs: 12, md: 4 }}>
                            <FormControl fullWidth>
                                <InputLabel id="att-select-label">Attendance TYpe</InputLabel>
                                <Select
                                    labelId="att-select-label"
                                    id="attendance-select"
                                    value={markType}
                                    label="Attendance Type"
                                    onChange={(e) => setMarkType(e.target.value as 'IN' | 'OUT' | 'ABSENT')}
                                >
                                    <MenuItem value="IN">Clock-In</MenuItem>
                                    <MenuItem value="OUT">Clock-Out</MenuItem>
                                    <MenuItem value="ABSENT">Absent</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleMarkAttendance}
                        >
                            Submit
                        </Button>
                    </Box>
                </Paper>
            )}


            {/* filters */}
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Grid container spacing={3}>
                    <Grid sx={{ xs: 12, md: 6}}>
                        <FormControl fullWidth>
                            <InputLabel id="employee-filter-label">Employee</InputLabel>
                            <Select
                                labelId="employee-filter-label"
                                id="employee-filter"
                                value={selectedEmployee}
                                label="Employee"
                                onChange={handleEmployeeSelect}
                            >
                                <MenuItem value="">
                                    <em>All Employee</em>
                                </MenuItem>
                                {employees.map((emp) => (
                                    <MenuItem key={emp.employeeId} value={emp.employeeId.toString()}>
                                        {emp.firstName} {emp.lastName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid sx={{ xs: 12, md: 6}}>
                        <TextField
                            id="filter-date"
                            label="Date"
                            type="date"
                            fullWidth
                            value={selectedDate}
                            onChange={handleDateChange}
                            slotProps={{
                                inputLabel: {
                                    shrink: true
                                }
                            }}
                        />
                    </Grid>
                </Grid>
            </Paper>

            {/* attendance table */}
            <Paper elevation={3}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                        <CircularProgress/>
                    </Box>
                ) : attendances.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center'}}>
                        <Typography color="textSecondary">
                            No attendance records found for the selected criteria
                        </Typography>
                    </Box>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Employee</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Clock In</TableCell>
                                    <TableCell>Clock Out</TableCell>
                                    <TableCell>Working Hours</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {attendances.map((att) => {
                                    const employee = employees.find(emp => emp.employeeId === att.employee.employeeId);

                                    return (
                                        <TableRow key={att.attendance_id}>
                                            <TableCell>
                                                {employee ? `${employee.firstName} ${employee.lastName}` : `ID: ${att.employee.employeeId}`}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(att.date).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                {att.clockIn ? formatTime(att.clockIn) : 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                {att.clockOut ? formatTime(att.clockOut) : 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                {att.status || 
                                                (att.clockIn && !att.clockOut ? 'Working' : 
                                                    att.clockIn && att.clockOut ? 'Present' : 'Absent')}
                                            </TableCell>
                                            <TableCell>
                                                {att.clockIn && att.clockOut ? 
                                                `${((new Date(att.clockOut).getTime() - new Date(att.clockIn).getTime()) / (1000 * 60 * 60)).toFixed(2)} hrs` : 
                                                'N/A'}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>
        </Container>
    )
}