//services/api.ts

import { stat } from "fs";

const API_URL = 'http://localhost:8080';

// helper for handling api responses
const handleResponse = async (response: Response) => {
    const text = await response.text(); // read raw text
    if (!response.ok) {
        let error = {};
        try {
            error = text ? JSON.parse(text) : {};
        } catch {
            // do nothing, fallback to default error
        }
        throw new Error((error as any).message || 'An error occurred');
    }

    return text ? JSON.parse(text) : {}; // return parsed JSON or empty object
};


// generic request function
const request = async (endpoint: string, options = {}) => {
    const user = localStorage.getItem('user');
    const headers= {
        'Content-Type': 'application/json',
        ...(user ? {Authorization: `Bearer ${JSON.parse(user).token}`} : {})
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            ...headers,
            ...(options as any).headers,
        },
    });

    return handleResponse(response);
};

// employee api
export const empApi = {
    getAll: () => request('/employee'),
    getById: (id: number) => request((`/employee/${id}`)),
    create: (data: any) => request(`/employee`, { method: 'POST', body: JSON.stringify(data)}),
    update: (id: number, data: any) => request(`/employee/${id}`, {method: 'PUT', body: JSON.stringify(data)}),
    delete: (id: number) => request(`/employee/${id}`, { method: 'DELETE'}),
    getByDepartment: (deptId: number) => request(`/employee/department/${deptId}`),
    assignToDept: (empId: number, deptId: number) => request(`/employee/${empId}/department/${deptId}`, { method: 'PUT' }),
    assignManager: (empId: number, managerId: number) => request(`/employee/${empId}/manager/${managerId}`, { method: 'PUT' }),
    updateStatus: (empId: number, status: string) => request(`/employee/${empId}/status/${status}`, { method: 'PUT' }),
};

// department api
export const deptAPI = {
    getAll: () => request('/departments'),
    getById: (id: number) => request(`/departments/${id}`),
    create: (data: any) => request('/departments', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => request(`/departments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request(`/departments/${id}`, { method: 'DELETE' }),
    assignManager: (departmentId: number, managerId: number) => request(`/departments/${departmentId}/manager/${managerId}`, { method: 'PUT' }),
    getEmployees: (departmentId: number) => request(`/departments/${departmentId}/employees`),
};


// user api
export const userAPI = {
    getAll: () => request('/users'),
    getById: (id: number) => request(`/users/${id}`),
    register: (data: any) => request('/users/register', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request(`/users/${id}`, { method: 'DELETE' }),
    updateStatus: (userId: number, status: string) => request(`/users/${userId}/status/${status}`, { method: 'PUT' }),
    assignRole: (userId: number, role: string) => request(`/users/${userId}/role/${role}`, { method: 'PUT' }),
    linkToEmployee: (userId: number, employeeId: number) => request(`/users/${userId}/employee/${employeeId}`, { method: 'PUT' }),
};


// attendance api
export const attAPI = {
    getAll: () => request('/attendance'),
    getById: (id: number) => request(`/attendance/${id}`),
    getByEmployee: (employeeId: number) => request(`/attendance/employee/${employeeId}`),
    clockIn: (employeeId: number) => request(`/attendance/employee/${employeeId}/clock-in`, { method: 'POST' }),
    clockOut: (employeeId: number) => request(`/attendance/employee/${employeeId}/clock-out`, { method: 'POST' }),
    markAbsent: (employeeId: number, date: string) => request(`/attendance/employee/${employeeId}/mark-absent?date=${date}`, { method: 'POST' }),
};

// leave api
export const leaveAPI = {
    getById: (id: number) => request(`/leave/${id}`),
    getByEmployee: (employeeId: number) => request(`/leave/employee/${employeeId}`),
    getByStatus: (status: string) => request(`/leave/status/${status}`),
    apply: (data: any) => request('/leave', { method: 'POST', body: JSON.stringify(data) }),
    approve: (leaveId: number, approverId: number) => request(`/leave/${leaveId}/approve?approverId=${approverId}`, { method: 'PUT' }),
    reject: (leaveId: number, reviewerId: number) => request(`/leave/${leaveId}/reject?reviewerId=${reviewerId}`, { method: 'PUT' }),
    cancel: (leaveId: number) => request(`/leave/${leaveId}/cancel`, { method: 'PUT' })
}

