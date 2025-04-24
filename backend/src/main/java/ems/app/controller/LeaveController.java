package ems.app.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import ems.app.model.EmployeeModel;
import ems.app.model.LeaveModel;
import ems.app.service.EmployeeService;
import ems.app.service.LeaveService;

@RestController
@RequestMapping("/leave")
@CrossOrigin(origins = {"http://192.168.1.4:3000", "http://localhost:3000"})
public class LeaveController {
    private final LeaveService lvService;
    private final EmployeeService empService;
    
    @Autowired
    public LeaveController(LeaveService lvService, EmployeeService empService) {
        this.lvService = lvService;
        this.empService = empService;
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<LeaveModel> getLeaveById(@PathVariable Long id) {
        Optional<LeaveModel> leave = lvService.getLeaveById(id);
        return leave.map(ResponseEntity::ok)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Leave not found"));
    }
    
    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<LeaveModel>> getLeaveByEmployee(@PathVariable Long employeeId) {
        Optional<EmployeeModel> employeeOpt = empService.getEmployeeById(employeeId);
        if (employeeOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found");
        }
        
        List<LeaveModel> leaves = lvService.getLeaveByEmployee(employeeOpt.get());
        return ResponseEntity.ok(leaves);
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<LeaveModel>> getLeaveByStatus(@PathVariable String status) {
        List<LeaveModel> leaves = lvService.getLeaveByStatus(status);
        return ResponseEntity.ok(leaves);
    }
    
    @GetMapping("/date/{date}")
    public ResponseEntity<List<LeaveModel>> getLeavesForDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<LeaveModel> leaves = lvService.getLeavesForDate(date);
        return ResponseEntity.ok(leaves);
    }
    
    @PostMapping
    public ResponseEntity<LeaveModel> applyForLeave(@RequestBody LeaveModel leave) {
        try {
            LeaveModel savedLeave = lvService.applyForLeave(leave);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedLeave);
        } catch (RuntimeException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }
    
    @PutMapping("/{id}/approve")
    public ResponseEntity<LeaveModel> approveLeave(
            @PathVariable Long id, 
            @RequestParam Long approverId) {
        try {
            Optional<EmployeeModel> approverOpt = empService.getEmployeeById(approverId);
            if (approverOpt.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Approver not found");
            }
            
            LeaveModel approvedLeave = lvService.approveLeave(id, approverOpt.get());
            return ResponseEntity.ok(approvedLeave);
        } catch (RuntimeException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }
    
    @PutMapping("/{id}/reject")
    public ResponseEntity<LeaveModel> rejectLeave(
            @PathVariable Long id, 
            @RequestParam Long reviewerId) {
        try {
            Optional<EmployeeModel> reviewerOpt = empService.getEmployeeById(reviewerId);
            if (reviewerOpt.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Reviewer not found");
            }
            
            LeaveModel rejectedLeave = lvService.rejectedLeave(id, reviewerOpt.get());
            return ResponseEntity.ok(rejectedLeave);
        } catch (RuntimeException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }
    
    @PutMapping("/{id}/cancel")
    public ResponseEntity<LeaveModel> cancelLeave(@PathVariable Long id) {
        try {
            LeaveModel canceledLeave = lvService.cancelLeave(id);
            return ResponseEntity.ok(canceledLeave);
        } catch (RuntimeException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLeave(@PathVariable Long id) {
        try {
            lvService.deleteLeave(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error deleting leave");
        }
    }
    
    @GetMapping("/used-leaves")
    public ResponseEntity<Integer> getUsedLeavesByTypeAndYear(
            @RequestParam Long employeeId,
            @RequestParam String leaveType,
            @RequestParam Integer year) {
        
        Optional<EmployeeModel> employeeOpt = empService.getEmployeeById(employeeId);
        if (employeeOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found");
        }
        
        int usedLeaves = lvService.getUsedLeavesByTypeAndYear(employeeOpt.get(), leaveType, year);
        return ResponseEntity.ok(usedLeaves);
    }
    
    @GetMapping("/check-overlap")
    public ResponseEntity<Boolean> checkOverlappingLeaves(
            @RequestParam Long employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        Optional<EmployeeModel> employeeOpt = empService.getEmployeeById(employeeId);
        if (employeeOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found");
        }
        
        boolean hasOverlap = lvService.hasOverlappingLeaves(employeeOpt.get(), startDate, endDate);
        return ResponseEntity.ok(hasOverlap);
    }
}
