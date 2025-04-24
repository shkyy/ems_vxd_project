'use client';

import { useAuth } from "@/context/AuthContext";
import { deptAPI, empApi } from "@/services/api";
import { Department, Employee } from "@/types";
import { FilterList, PersonAdd, Visibility } from "@mui/icons-material";
import { Avatar, Box, Button, Chip, CircularProgress, Container, Grid, IconButton, MenuItem, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function EmployeePage () {
    const { user } = useAuth();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState<number | null>(null);
    const [filter, setFilter] = useState({
        department: '', 
        status: '',
        search: ''
    });

    useEffect(() => {
        const fetchedData = async () => {
            try {
                const [emps, depts] = await Promise.all([
                    empApi.getAll(),
                    deptAPI.getAll()
                ]);
                setEmployees(emps);
                setDepartments(depts);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching employees: ', error);
                setLoading(false);
            }

            fetchedData();
        }
    }, []);

    const handleFilter = () => {
        setLoading(true);

        const fetchFilteredData = async () => {
            try {

                let filteredEmp = await empApi.getAll();

                // filter by department if selected
                if (filter.department) {
                    filteredEmp = await empApi.getByDepartment(parseInt(filter.department));
                }

                // apply status filter if selected
                if (filter.status) {
                    filteredEmp = filteredEmp.filter(
                        (emp: Employee) => emp.status === filter.status
                    );
                }

                // apply search filter if entered
                if (filter.search) {
                    const searchWord = filter.search.toLowerCase();
                    filteredEmp = filteredEmp.filter(
                        (emp: Employee) => 
                            emp.firstName.toLowerCase().includes(searchWord) ||
                            emp.lastName.toLowerCase().includes(searchWord) ||
                            emp.email.toLowerCase().includes(searchWord) ||
                            emp.jobTitle.toLowerCase().includes(searchWord)
                    );
                }

                setEmployees(filteredEmp);
                setLoading(false);
            } catch (error) {
                console.error('Error filtering employees:', error);
                setLoading(false);
            }
        };

        fetchFilteredData();
    };

    const openDeleteDialog = (id: number) => {
        setEmployeeToDelete(id);
        setDeleteDialogOpen(true);
    };

    const handleDeleteComfirm = async () => {
        if (employeeToDelete) {
            try {
                await empApi.delete(employeeToDelete);
                setEmployees(employees.filter(emp => emp.employeeId !== employeeToDelete));
                setDeleteDialogOpen(false);
            } catch(error) {
                console.error('Error deleting employee: ', error);
            }
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return {
                    color: 'success',
                    variant: 'outlined'
                };
            case 'ON_LEAVE':
                return {
                    color: 'warning',
                    variant: 'outlined'
                };
            case 'INACTIVE':
                return {
                    color: 'error',
                    variant: 'outlined'
                };
            default:
                return {
                    color: 'default',
                    variant: 'outlined'
                };
        }
    };

    return (
        <Container maxWidth='xl'>
            <Box sx={{py: 3}}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3}}>
                    <Typography variant="h4" component='h1' fontWeight='500'>
                        Employees
                    </Typography>
                    {(user?.role !== 'USER') && (
                        <Button
                            variant="contained"
                            LinkComponent={Link}
                            href="/employees/add"
                            startIcon={<PersonAdd/>}
                        >
                            Add Employee
                        </Button>
                    )}
                </Box>

                <Paper elevation={2} sx={{ p: 3, mb: 2}}>
                    <Grid container spacing={3}>
                        <Grid sx={{ xs: 12, md: 4}}>
                            <TextField
                                select
                                fullWidth
                                label='Department'
                                value={filter.department}
                                onChange={(e) => setFilter({...filter, department: e.target.value})}
                                variant="outlined"
                                size="small"
                            >
                                <MenuItem value="">All Departments</MenuItem>
                                {departments.map((dept) => (
                                    <MenuItem key={dept.departmentId} value={dept.departmentId}>
                                        {dept.departmentName}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid sx={{ xs: 12, md: 4}}>
                            <TextField
                                select
                                fullWidth
                                label='Status'
                                value={filter.status}
                                onChange={(e) => setFilter({...filter, status: e.target.value})}
                                variant="outlined"
                                size="small"
                            >
                                <MenuItem value="">All Status</MenuItem>
                                <MenuItem value="ACTIVE">Active</MenuItem>
                                <MenuItem value="INACTIVE">Inactive</MenuItem>
                                <MenuItem value="ON_LEAVE">On Leave</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid sx={{ xs: 12, md: 4}}>
                            <TextField
                                fullWidth
                                label='Search'
                                value={filter.search}
                                onChange={(e) => setFilter({...filter, search: e.target.value})}
                                variant="outlined"
                                size="small"
                            />
                        </Grid>
                    </Grid>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button variant="contained" onClick={handleFilter} startIcon={<FilterList/>}>
                            Apply Filters
                        </Button>
                    </Box>
                </Paper>

                {employees.length === 0 ? (
                    <Paper elevation={2} sx={{ p: 6, textAlign: 'center'}}>
                        <Typography variant="body1" color="text.secondary">
                            No Employees Found
                        </Typography>
                    </Paper>
                ) : (
                    <TableContainer component={Paper} elevation={3}>
                        <Table sx={{ minWidth: 650 }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Employee</TableCell>
                                    <TableCell>Job Title</TableCell>
                                    <TableCell>Department</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Contact</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {employees.map((emp) => (
                                    <TableRow
                                        key={emp.employeeId}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0}}}
                                    >
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center'}}>
                                                <Avatar sx={{ bgcolor: 'primary.light'}}>
                                                    {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                                                </Avatar>
                                                <Box sx={{ ml: 2}}>
                                                    <Typography variant="subtitle2">
                                                        {emp.firstName} {emp.lastName}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {emp.email}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>{emp.jobTitle}</TableCell>
                                        <TableCell>{emp.department?.departmentName || 'Unassigned'}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={emp.status}
                                                size="small"
                                                color={getStatusColor(emp.status).color as any}
                                                variant={getStatusColor(emp.status).variant as any}
                                            />
                                        </TableCell>
                                        <TableCell>{emp.contactNo}</TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                LinkComponent={Link}
                                                href={`/employees/${emp.employeeId}`}
                                                size="small"
                                                color="primary"
                                            >
                                                <Visibility fontSize="small"/>
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Box>
        </Container>
    )
}