'use client';

import { useAuth } from "@/context/AuthContext";
import { deptAPI, empApi } from "@/services/api";
import { Department, Employee } from "@/types";
import { Add, Delete, Edit, Search, Visibility } from "@mui/icons-material";
import { Box, Button, Card, CardActions, CardContent, CircularProgress, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, InputAdornment, Paper, TextField, Typography } from "@mui/material";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function DepartmentPahe() {
    const { user } = useAuth();
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [searchWord, setSearchWord] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [departmentToDelete, setDepartmentToDelete] = useState<number | null>(null);

    useEffect(() => {
        const fetchedData = async () => {
            try {
                const [depts, emps] = await Promise.all([
                    deptAPI.getAll(),
                    empApi.getAll()
                ]);
                setDepartments(depts);
                setEmployees(emps);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching employees: ', error);
                setLoading(false);
            }
        }
        fetchedData();

    }, []);

    const openDeleteDialog = (id: number) => {
        setDepartmentToDelete(id);
        setDeleteDialogOpen(true);
    };

    const handleDelteConfirm = async () => {
        if (departmentToDelete) {
            try {
                await deptAPI.delete(departmentToDelete);
                setDepartments(departments.filter(dept => dept.departmentId !== departmentToDelete));
                setDeleteDialogOpen(false);
            } catch (error) {
                console.error('Error deleting department: ', error);
                alert('Failed to delete department');
            }
        }
    };

    const filteredDepartments = departments.filter(
        dept => dept.departmentName.toLowerCase().includes(searchWord.toLowerCase()) ||
                dept.location.toLowerCase().includes(searchWord.toLowerCase())
    );

    const getEmployeeCount = (departmentId: number) => {
        return employees.filter(emp => emp.department?.departmentId === departmentId).length;
    };

    return (
        <Container maxWidth="xl">
            <Box sx={{ py: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3}}>
                    <Typography variant="h4" component='h4' fontWeight="500">
                        Departments
                    </Typography>
                    {(user?.role !== 'ADMIN') && (
                        <Button
                        variant="contained"
                        startIcon={<Add />}
                        LinkComponent={Link}
                        href="/departments/form"
                        >
                        Add Department
                        </Button>
                    )}
                </Box>
                <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
                    <TextField
                        fullWidth
                        placeholder="Search departments by name or location..."
                        value={searchWord}
                        onChange={(e) => setSearchWord(e.target.value)}
                        variant="outlined"
                        size="small"
                        InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search />
                            </InputAdornment>
                        ),
                        }}
                    />
                </Paper>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                        <CircularProgress />
                    </Box>
                    ) : filteredDepartments.length === 0 ? (
                    <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
                        <Typography color="text.secondary">No departments found</Typography>
                    </Paper>
                    ) : (
                    <Grid container spacing={3}>
                        {filteredDepartments.map((department) => (
                        <Grid sx={{ xs: 12, md: 6, lg: 4 }} key={department.departmentId}>
                            <Card elevation={3}>
                            <CardContent>
                                <Typography variant="h6" component="h2" gutterBottom>
                                {department.departmentName}
                                </Typography>
                                <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    <Box component="span" fontWeight="medium">Location:</Box> {department.location}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    <Box component="span" fontWeight="medium">Manager:</Box> {department.manager ? 
                                    `${department.manager.firstName} ${department.manager.lastName}` : 
                                    'Not Assigned'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    <Box component="span" fontWeight="medium">Employees:</Box> {getEmployeeCount(department.departmentId)}
                                </Typography>
                                </Box>
                            </CardContent>
                            <CardActions sx={{ justifyContent: 'flex-end', p: 2, pt: 0 }}>
                                <Button
                                size="small"
                                startIcon={<Visibility />}
                                component={Link}
                                href={`/departments/${department.departmentId}`}
                                color="primary"
                                >
                                View
                                </Button>
                                {(user?.role === 'ADMIN' || user?.role === 'HR') && (
                                <>
                                    <Button
                                    size="small"
                                    startIcon={<Edit />}
                                    component={Link}
                                    href={`/departments/edit/${department.departmentId}`}
                                    color="secondary"
                                    >
                                    Edit
                                    </Button>
                                    <Button
                                    size="small"
                                    startIcon={<Delete />}
                                    onClick={() => openDeleteDialog(department.departmentId)}
                                    color="error"
                                    >
                                    Delete
                                    </Button>
                                </>
                                )}
                            </CardActions>
                            </Card>
                        </Grid>
                        ))}
                    </Grid>
                    )}
                </Box>
                <Dialog
                    open={deleteDialogOpen}
                    onClose={() => setDeleteDialogOpen(false)}
                >
                    <DialogTitle>Confirm Delete</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to delete this department? This may affect associated employees.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleDelteConfirm} color="error" variant="contained">
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>
        </Container>
    )
}