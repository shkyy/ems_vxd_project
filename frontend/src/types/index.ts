// types/index.ts
export interface Employee {
    employeeId: number;
    firstName: string;
    lastName: string;
    email: string;
    contactNo: string;
    hiredDate: string;
    jobTitle: string;
    salary: number;
    address: string;
    dateOfBirth: string;
    gender: string;
    status: string;
    department?: Department;
    manager?: Employee;
    createdAt: string;
    updatedAt: string;
}
  
export interface Department {
    departmentId: number;
    departmentName: string;
    location: string;
    manager?: Employee;
    createdAt: string;
    updatedAt: string;
}
  
export interface Attendance {
    attendance_id: number;
    employee: Employee;
    date: string;
    clockIn: string;
    clockOut: string;
    status: string;
    workingHrs: number;
    createdAt: string;
    updatedAt: string;
}
  
export interface Leave {
    leave_id: number;
    employee: Employee;
    leaveType: string;
    startDate: string;
    endDate: string;
    totaldays: number;
    reason: string;
    status: string;
    approvedBy?: Employee;
    approvalDate?: string;
    createdAt: string;
    updatedAt: string;
}
  
export interface User {
    userId: number;
    username: string;
    email: string;
    role: string;
    status: string;
    employee?: Employee;
}
  
export type PaginatedResponse<T> = {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
};