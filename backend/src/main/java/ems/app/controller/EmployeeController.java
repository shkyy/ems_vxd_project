package ems.app.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import ems.app.model.DepartmentModel;
import ems.app.model.EmployeeModel;
import ems.app.service.DepartmentService;
import ems.app.service.EmployeeService;
import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/employee")
public class EmployeeController {
    
    private final EmployeeService empService;
    private final DepartmentService deptService;

    @Autowired
    public EmployeeController(EmployeeService empService, DepartmentService deptService) {
        this.empService = empService;
        this.deptService = deptService;
    }

    @GetMapping
    public ResponseEntity<List<EmployeeModel>> getAllEmployees() {
        List<EmployeeModel> employees = empService.getAllEmployees();
        return new ResponseEntity<>(employees, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmployeeModel> getEmployeeById(@PathVariable Long id) {
        Optional<EmployeeModel> employee = empService.getEmployeeById(id);
        return employee.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
    
    @GetMapping("/email/{email}")
    public ResponseEntity<EmployeeModel> getEmployeeByEmail(@PathVariable String email) {
        Optional<EmployeeModel> employee = empService.getEmployeeByEmail(email);
        return employee.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
    
    @GetMapping("/department/{departmentId}")
    public ResponseEntity<List<EmployeeModel>> getEmployeesByDepartment(@PathVariable Long departmentId) {
        Optional<DepartmentModel> department = deptService.getDepartmentById(departmentId);
        if (!department.isPresent()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        List<EmployeeModel> employees = empService.getEmployeesByDepartment(department.get());
        return new ResponseEntity<>(employees, HttpStatus.OK);
    }


    @GetMapping("/job-title/{jobTitle}")
    public ResponseEntity<List<EmployeeModel>> getEmployeesByJobTitle(
            @PathVariable String jobTitle) {
        List<EmployeeModel> employees = empService.getEmployeesByJobTitile(jobTitle);
        return new ResponseEntity<>(employees, HttpStatus.OK);
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<EmployeeModel>> getEmployeesByStatus(@PathVariable String status) {
        List<EmployeeModel> employees = empService.getEmployeeByStatus(status);
        return new ResponseEntity<>(employees, HttpStatus.OK);
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<EmployeeModel>> searchEmployeesByName(@RequestParam String keyword) {
        List<EmployeeModel> employees = empService.searchEmployeeByName(keyword);
        return new ResponseEntity<>(employees, HttpStatus.OK);
    }
    
    @GetMapping("/hired-between")
    public ResponseEntity<List<EmployeeModel>> getEmployeesHiredBetween(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<EmployeeModel> employees = empService.getEmployeeByHiredBetween(startDate, endDate);
        return new ResponseEntity<>(employees, HttpStatus.OK);
    }
    
    @PostMapping
    public ResponseEntity<EmployeeModel> createEmployee(@Valid @RequestBody EmployeeModel employee) {
        EmployeeModel savedEmployee = empService.saveEmployee(employee);
        return new ResponseEntity<>(savedEmployee, HttpStatus.CREATED);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<EmployeeModel> updateEmployee(
            @PathVariable Long id, @Valid @RequestBody EmployeeModel employee) {
        if (!empService.getEmployeeById(id).isPresent()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        employee.setEmployeeId(id);
        EmployeeModel updatedEmployee = empService.updateEmployee(employee);
        return new ResponseEntity<>(updatedEmployee, HttpStatus.OK);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEmployee(@PathVariable Long id) {
        if (!empService.getEmployeeById(id).isPresent()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        empService.deleteEmployee(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
    
    @PutMapping("/{employeeId}/department/{departmentId}")
    public ResponseEntity<EmployeeModel> assignToDepartment(
            @PathVariable Long employeeId, @PathVariable Long departmentId) {
        Optional<DepartmentModel> department = deptService.getDepartmentById(departmentId);
        if (!department.isPresent()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        try {
            EmployeeModel employee = empService.assignDepartment(employeeId, department.get());
            return new ResponseEntity<>(employee, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    @PutMapping("/{employeeId}/manager/{managerId}")
    public ResponseEntity<EmployeeModel> assignManager(
            @PathVariable Long employeeId, @PathVariable Long managerId) {
        Optional<EmployeeModel> manager = empService.getEmployeeById(managerId);
        if (!manager.isPresent()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        try {
            EmployeeModel employee = empService.assignManager(employeeId, manager.get());
            return new ResponseEntity<>(employee, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    @PutMapping("/{employeeId}/status/{status}")
    public ResponseEntity<EmployeeModel> updateEmployeeStatus(
            @PathVariable Long employeeId, @PathVariable String status) {
        try {
            EmployeeModel employee = empService.updateStatus(employeeId, status);
            return new ResponseEntity<>(employee, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
}
