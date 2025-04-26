'use client';

import { deptAPI, empApi } from "@/services/api";
import { Department, Employee } from "@/types";
import { Cancel } from "@mui/icons-material";
import { Alert, Button, CircularProgress, FormControl, FormHelperText, InputLabel, MenuItem, Paper, Select, SelectChangeEvent, Snackbar, TextField, Typography } from "@mui/material";
import { Box, Grid } from "@mui/system";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface EmployeeFormProps {
    empId?: number;
    isEdit?: boolean;
}

export default function EmployeeForm({ empId, isEdit = false }: EmployeeFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [managers, setManagers] = useState<Employee[]>([]);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        contactNo: '',
        hiredDate: '',
        jobTitle: '',
        salary: '',
        address: '',
        dateOfBirth: '',
        gender: 'MALE',
        status: 'ACTIVE',
        departmentId: '',
        managerId: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchedData = async () => {
            try {
                const [depts, emps] = await Promise.all([
                    deptAPI.getAll(),
                    empApi.getAll()
                ]);

                setDepartments(depts);
                setManagers(emps);

                // when updating, fetch employee data
                if (isEdit && empId) {
                    const employeeData = await empApi.getById(empId);
                    setFormData({
                        firstName: employeeData.firstName,
                        lastName: employeeData.lastName,
                        email: employeeData.email,
                        contactNo: employeeData.contactNo,
                        hiredDate: employeeData.hiredDate.split('T')[0],
                        jobTitle: employeeData.jobTitle,
                        salary: employeeData.salary.toString(),
                        address: employeeData.address,
                        dateOfBirth: employeeData.dateOfBirth.split('T')[0],
                        gender: employeeData.gender,
                        status: employeeData.status,
                        departmentId: employeeData.department?.departmentId.toString() || '',
                        managerId: employeeData.manager?.employeeId.toString() || ''
                    });
                }
            } catch (error) {
                console.error('Error fetching form data: ', error);
                setError('Failed to load required data');
            }
        };

        fetchedData();
    }, [empId, isEdit]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | {name?: string; value: unknown}> | SelectChangeEvent) => {
        const name = e.target.name as string;
        const value = e.target.value as string;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // validate form data
            if (!formData.firstName || !formData.lastName || !formData.email || !formData.jobTitle) {
                setError('Please fill in all required fields');
                setLoading(false);
                return;
            }

            // parse numeric values
            const employeeData = {
                ...formData,
                salary: parseFloat(formData.salary),
            }

            if (isEdit && empId) {
                await empApi.update(empId, employeeData);

                // update department if provided
                if (formData.departmentId) {
                    await empApi.assignToDept(empId, parseInt(formData.departmentId));
                }

                // update manager if provided
                if (formData.managerId) {
                    await empApi.assignManager(empId, parseInt(formData.managerId));
                }

                setSuccess(true);
                setTimeout(() => router.push('/employees'), 1500);
            } else {
                const newEmployee = await empApi.create(employeeData);

                // assign department if provided
                if (formData.departmentId && newEmployee.employeeId) {
                    await empApi.assignToDept(newEmployee.employeeId, parseInt(formData.departmentId));
                }

                // assign manager if provided
                if (formData.managerId && newEmployee.employeeId) {
                    await empApi.assignToDept(newEmployee.employeeId, parseInt(formData.managerId));
                }

                setSuccess(true);
                setTimeout(() => router.push('/employees'), 1500);
            } 
        } catch (error) {
            console.error('Error saving employee: ', error);
            setError('Failed to save employee data');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        router.push('/employees');
    };

    return (
        <Paper elevation={3} sx={{ p: 4, maxWidth: 1000, mx: 'auto', mt: 4 }}>
            <Typography variant="h4" component='h1' gutterBottom>
                {isEdit? 'Edit Employee' : 'Add New Employee'}
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Box component='form' onSubmit={handleSubmit} noValidate>
                <Grid container spacing={3}>
                    <Grid sx={{ xs: 12, sm: 6 }}>
                        <TextField
                            required
                            fullWidth
                            label="First Name"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid sx={{ xs: 12, sm: 6 }}>
                        <TextField
                            required
                            fullWidth
                            label="Last Name"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                        />
                    </Grid>

                    <Grid sx={{ xs: 12, sm: 6 }}>
                        <TextField
                            required
                            fullWidth
                            label="Email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid sx={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label="Contact No"
                            name="contactNo"
                            value={formData.contactNo}
                            onChange={handleChange}
                        />
                    </Grid>

                    <Grid sx={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label="Hired date"
                            name="hiredDate"
                            type="date"
                            value={formData.hiredDate}
                            onChange={handleChange}
                            slotProps={{ inputLabel: {shrink: true} }}
                        />
                    </Grid>
                    <Grid sx={{ xs: 12, sm: 6 }}>
                        <TextField
                            required
                            fullWidth
                            label="Job Title"
                            name="jobTitle"
                            value={formData.jobTitle}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid sx={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label="Salary"
                            name="salary"
                            type="number"
                            value={formData.salary}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid sx={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label="Date of birth"
                            name="dateOfBirth"
                            type="date"
                            value={formData.dateOfBirth}
                            onChange={handleChange}
                            slotProps={{ inputLabel: {shrink: true} }}
                        />
                    </Grid>
                    <Grid sx={{ xs: 12 }}>
                        <TextField
                            fullWidth
                            label="Address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            multiline
                            rows={3}
                        />
                    </Grid>
                    <Grid sx={{ xs: 12, sm: 6 }}>
                        <FormControl fullWidth>
                            <InputLabel id='gender-label'>Gender</InputLabel>
                            <Select 
                                labelId="gender-label"
                                fullWidth
                                name="gender"
                                value={formData.gender}
                                label="Gender"
                                onChange={handleChange}
                            >
                                <MenuItem value="MALE">Male</MenuItem>
                                <MenuItem value="FEMALE">Female</MenuItem>
                                <MenuItem value="OTHER">Other</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid sx={{ xs: 12, sm: 6 }}>
                        <FormControl fullWidth>
                            <InputLabel id='status-label'>Status</InputLabel>
                            <Select 
                                labelId="status-label"
                                fullWidth
                                name="status"
                                value={formData.status}
                                label="Status"
                                onChange={handleChange}
                            >
                                <MenuItem value="ACTIVE">Active</MenuItem>
                                <MenuItem value="ON_LEAVE">On Leave</MenuItem>
                                <MenuItem value="TERMINATED">Terminated</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid sx={{ xs: 12, sm: 6 }}>
                        <FormControl fullWidth>
                            <InputLabel id='department-label'>Department</InputLabel>
                            <Select 
                                labelId="department-label"
                                fullWidth
                                name="department"
                                value={formData.departmentId}
                                label="Department"
                                onChange={handleChange}
                            >
                                <MenuItem value="">
                                    <em>None</em>
                                </MenuItem>
                                {departments.map((dept) => (
                                <MenuItem key={dept.departmentId} value={dept.departmentId.toString()}>
                                    {dept.departmentName}
                                </MenuItem>
                                ))}
                            </Select>
                            <FormHelperText>Assign to department</FormHelperText>
                        </FormControl>
                    </Grid>
                    <Grid sx={{ xs: 12, sm: 6 }}>
                        <FormControl fullWidth>
                            <InputLabel id='manager-label'>Manager</InputLabel>
                            <Select 
                                labelId="manager-label"
                                fullWidth
                                name="manager"
                                value={formData.managerId}
                                label="Manager"
                                onChange={handleChange}
                            >
                                <MenuItem value="">
                                    <em>None</em>
                                </MenuItem>
                                {managers
                                .filter(manager => !empId || manager.employeeId !== empId)
                                .map((manager) => (
                                    <MenuItem key={manager.employeeId} value={manager.employeeId.toString()}>
                                    {manager.firstName} {manager.lastName}
                                    </MenuItem>
                                ))}
                            </Select>
                            <FormHelperText>Assign to Manager</FormHelperText>
                        </FormControl>
                    </Grid>
                    <Grid sx={{ xs: 12, mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={handleCancel}
                            disabled={loading}
                            startIcon={<Cancel/>}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit" 
                            variant="contained" 
                            color="primary" 
                            disabled={loading}
                            startIcon={loading && <CircularProgress size={20} color="inherit" />}
                        >
                            { loading ? 'Saving..' : isEdit ? 'Update Employee' : 'Create Employee'}
                        </Button>
                    </Grid>
                </Grid>
            </Box>

            <Snackbar open={success} autoHideDuration={3000} onClose={() => setSuccess(false)}>
                <Alert severity="success" sx={{ width: '100%' }}>
                    Employee { isEdit ? 'updated' : 'created'} successfully!
                </Alert>
            </Snackbar>
        </Paper>
    );
}