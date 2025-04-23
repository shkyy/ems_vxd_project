package ems.app.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import ems.app.service.DepartmentService;
import ems.app.service.EmployeeService;
import jakarta.validation.Valid;
import ems.app.model.DepartmentModel;
import ems.app.model.EmployeeModel;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;



@RestController
@RequestMapping("/departments")
public class DepartmentController {
    private final DepartmentService deptService;
    private final EmployeeService empService;

    @Autowired
    public DepartmentController(
        DepartmentService deptService,
        EmployeeService empService
    ) {
        this.deptService = deptService;
        this.empService = empService;
    }

    @GetMapping
    public ResponseEntity<List<DepartmentModel>> getAllDepartments() {
        List<DepartmentModel> departments = deptService.getAllDepartments();
        return new ResponseEntity<>(departments, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DepartmentModel> getDepartmentById(@PathVariable Long id) {
        Optional<DepartmentModel> department = deptService.getDepartmentById(id);
        return department.map(value -> new ResponseEntity<>(value, HttpStatus.OK)).orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<DepartmentModel> getDepartmentByName(@PathVariable String name) {
        Optional<DepartmentModel> department = deptService.getDepartmentByName(name);
        return department.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
            .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }    

    @GetMapping("/location/{location}")
    public ResponseEntity<List<DepartmentModel>> getDepartmentByLocation(@PathVariable String location) {
        List<DepartmentModel> departments = deptService.getDepartmentByLocation(location);
        return new ResponseEntity<>(departments, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<DepartmentModel> createDepartment(@Valid @RequestBody DepartmentModel department) {
        DepartmentModel savedDepartment = deptService.saveDepartment(department);
        return new ResponseEntity<>(savedDepartment, HttpStatus.CREATED);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<DepartmentModel> updateDepartment(
            @PathVariable Long id, @Valid @RequestBody DepartmentModel department) {
        if (!deptService.getDepartmentById(id).isPresent()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        department.setDepartmentId(id);
        DepartmentModel updatedDepartment = deptService.updateDepartment(department);
        return new ResponseEntity<>(updatedDepartment, HttpStatus.OK);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDepartment(@PathVariable Long id) {
        if (!deptService.getDepartmentById(id).isPresent()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        deptService.deleteDepartment(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
    
    @PutMapping("/{departmentId}/manager/{managerId}")
    public ResponseEntity<DepartmentModel> assignManager(
            @PathVariable Long departmentId, @PathVariable Long managerId) {
        Optional<EmployeeModel> manager = empService.getEmployeeById(managerId);
        if (!manager.isPresent()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        try {
            DepartmentModel department = deptService.assignManager(departmentId, manager.get());
            return new ResponseEntity<>(department, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    @GetMapping("/{id}/employees")
    public ResponseEntity<List<EmployeeModel>> getEmployeesByDepartment(@PathVariable Long id) {
        Optional<DepartmentModel> department = deptService.getDepartmentById(id);
        if (!department.isPresent()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        List<EmployeeModel> employees = empService.getEmployeesByDepartment(department.get());
        return new ResponseEntity<>(employees, HttpStatus.OK);
    }
    
}
