'use client';

import { deptAPI, empApi } from "@/services/api";
import { Employee } from "@/types";
import { Cancel } from "@mui/icons-material";
import { Alert, Box, Button, Card, CardContent, CircularProgress, Container, FormControl, FormHelperText, Grid, InputLabel, MenuItem, Select, SelectChangeEvent, TextField, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface DepartmentFormProps {
    departmentId?: number;
    isEdit?: boolean;
}

export default function DepartmentForm({ departmentId, isEdit = false}: DepartmentFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [formData, setFormData] = useState({
        departmentName: '',
        location: '',
        managerId: ''
    });
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchedData = async () => {
            try {
                // fetch emloyees for manager selection
                const emps = await empApi.getAll();
                setEmployees(emps);

                // if editing then fetch department data
                if (isEdit && departmentId) {
                    const deptData = await deptAPI.getById(departmentId);
                    setFormData({
                        departmentName: deptData.departmentName,
                        location: deptData.location,
                        managerId: deptData.manager?.employeeId.toString() || ''
                    });
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to load required data');
            }
        };

        fetchedData();
    }, [departmentId, isEdit]);

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
            if (!formData.departmentName) {
                setError('Department name is required');
                setLoading(false);
                return;
            }

            if (isEdit && departmentId) {
                await deptAPI.update(departmentId, {
                    departmentName: formData.departmentName,
                    location: formData.location
                });

                // update manager if provided
                if (formData.managerId) {
                    await deptAPI.assignManager(departmentId, parseInt(formData.managerId));
                }
            } else {
                const newDept = await deptAPI.create({
                    departmentName: formData.departmentName,
                    location: formData.location
                });

                //assign manager if needed
                if (formData.managerId && newDept.departmentId) {
                    await deptAPI.assignManager(newDept.departmentId, parseInt(formData.managerId));
                }
            }

            // Redirect to derpartments list after successful submission
            router.push('/departments');
        } catch (error) {
            console.error('Error submitting department data:', error);
            setError('Failed to save department data');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth='lg'>
            <Box sx={{ py: 4 }}>
                <Typography variant="h4" component='h1' gutterBottom sx={{ mb: 3}}>
                    {isEdit ? 'Edit Department' : 'Add New Department'}
                </Typography>

                {error && (
                    <Alert severity="error"  sx={{ mb: 3}}>
                        {error}
                    </Alert>
                )}

                <Card elevation={3}>
                    <CardContent>
                        <Box component='form' onSubmit={handleSubmit} noValidate>
                            <Grid container spacing={3}>
                                <Grid sx={{ xs: 12, md: 6 }}>
                                    <TextField
                                        required
                                        fullWidth
                                        label='Department Name'
                                        name="departmentName"
                                        value={formData.departmentName}
                                        onChange={handleChange}
                                        variant="outlined"
                                        helperText="Required field"
                                    />
                                </Grid>
                                <Grid sx={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        label='Location'
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid sx={{ xs: 12}}>
                                    <FormControl fullWidth variant="outlined">
                                        <InputLabel id='manager-select-label'>Department Manager</InputLabel>
                                        <Select
                                            labelId="manager-select-label"
                                            id="manager-select"
                                            name="managerId"
                                            value={formData.managerId}
                                            onChange={handleChange}
                                            label="Department Manager"
                                        >
                                            <MenuItem value="">
                                                <em>None</em>
                                            </MenuItem>
                                            {employees.map((emp) => (
                                                <MenuItem key={emp.employeeId} value={emp.employeeId.toString()}>
                                                    {emp.firstName} {emp.lastName} ({emp.jobTitle})
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        <FormHelperText>Select a manager for this department</FormHelperText>
                                    </FormControl>
                                </Grid>
                            </Grid>
                            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                <Button variant="outlined" color="secondary" onClick={() => router.push('/departments')} startIcon={<Cancel/>} disabled={loading}>
                                    Cancel
                                </Button>
                                <Button
                                    type="submit" 
                                    variant="contained" 
                                    color="primary" 
                                    disabled={loading}
                                    startIcon={loading && <CircularProgress size={20} color="inherit" /> }
                                >
                                    { loading ? 'Saving..' : isEdit ? 'Update Department' : 'Create Department'}
                                </Button>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </Container>
    )
}