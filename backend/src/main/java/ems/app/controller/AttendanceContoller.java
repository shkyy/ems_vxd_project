package ems.app.controller;

import java.time.LocalDate;
import java.time.LocalTime;
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

import ems.app.model.AttendanceModel;
import ems.app.model.EmployeeModel;
import ems.app.service.AttendanceService;
import ems.app.service.EmployeeService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/attendance")
@CrossOrigin(origins = {"http://192.168.1.4:3000", "http://localhost:3000"})
public class AttendanceContoller {
    
    private final AttendanceService attService;
    private final EmployeeService empService;
    
    @Autowired
    public AttendanceContoller(AttendanceService attService, EmployeeService empService) {
        this.attService = attService;
        this.empService = empService;
    }
    
    @GetMapping
    public ResponseEntity<List<AttendanceModel>> getAllAttendances() {
        List<AttendanceModel> attendances = attService.getALlAttendances();
        return new ResponseEntity<>(attendances, HttpStatus.OK);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<AttendanceModel> getAttendanceById(@PathVariable Long id) {
        Optional<AttendanceModel> attendance = attService.getAttendanceById(id);
        return attendance.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
    
    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<AttendanceModel>> getAttendancesByEmployee(@PathVariable Long employeeId) {
        Optional<EmployeeModel> employee = empService.getEmployeeById(employeeId);
        if (!employee.isPresent()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        List<AttendanceModel> attendances = attService.getAttendanceByEmployee(employee.get());
        return new ResponseEntity<>(attendances, HttpStatus.OK);
    }
    
    @GetMapping("/date/{date}")
    public ResponseEntity<List<AttendanceModel>> getAttendanceByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<AttendanceModel> attendances = attService.getAttendanceByDate(date);
        return new ResponseEntity<>(attendances, HttpStatus.OK);
    }
    
    @GetMapping("/employee/{employeeId}/date-range")
    public ResponseEntity<List<AttendanceModel>> getAttendancesByEmployeeAndDateRange(
            @PathVariable Long employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        Optional<EmployeeModel> employee = empService.getEmployeeById(employeeId);
        if (!employee.isPresent()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        List<AttendanceModel> attendances = attService.getAttendanceByEmployeeAndDateRange(
                employee.get(), startDate, endDate);
        return new ResponseEntity<>(attendances, HttpStatus.OK);
    }
    
    @PostMapping
    public ResponseEntity<AttendanceModel> createAttendance(@Valid @RequestBody AttendanceModel attendance) {
        AttendanceModel savedAttendance = attService.saveAttedance(attendance);
        return new ResponseEntity<>(savedAttendance, HttpStatus.CREATED);
    }
    
    @PostMapping("/employee/{employeeId}/clock-in")
    public ResponseEntity<AttendanceModel> clockIn(
            @PathVariable Long employeeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime time) {
        Optional<EmployeeModel> employee = empService.getEmployeeById(employeeId);
        if (!employee.isPresent()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        // Use current date and time if not provided
        LocalDate attendanceDate = (date != null) ? date : LocalDate.now();
        LocalTime clockInTime = (time != null) ? time : LocalTime.now();
        
        AttendanceModel attendance = attService.clockIn(employee.get(), attendanceDate, clockInTime);
        return new ResponseEntity<>(attendance, HttpStatus.OK);
    }
    
    @PostMapping("/employee/{employeeId}/clock-out")
    public ResponseEntity<AttendanceModel> clockOut(
            @PathVariable Long employeeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime time) {
        Optional<EmployeeModel> employee = empService.getEmployeeById(employeeId);
        if (!employee.isPresent()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        // Use current date and time if not provided
        LocalDate attendanceDate = (date != null) ? date : LocalDate.now();
        LocalTime clockOutTime = (time != null) ? time : LocalTime.now();
        
        try {
            AttendanceModel attendance = attService.clockOut(employee.get(), attendanceDate, clockOutTime);
            return new ResponseEntity<>(attendance, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/{attendanceId}/status/{status}")
public ResponseEntity<AttendanceModel> updateAttendanceStatus(
        @PathVariable Long attendanceId, @PathVariable String status) {
    try {
        AttendanceModel attendance = attService.updateAttendanceStatus(attendanceId, status);
        return new ResponseEntity<>(attendance, HttpStatus.OK);
    } catch (RuntimeException e) {
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
}

@DeleteMapping("/{id}")
public ResponseEntity<Void> deleteAttendance(@PathVariable Long id) {
    if (!attService.getAttendanceById(id).isPresent()) {
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
    attService.deleteAttendance(id);
    return new ResponseEntity<>(HttpStatus.NO_CONTENT);
}

@PostMapping("/employee/{employeeId}/mark-absent")
public ResponseEntity<AttendanceModel> markAbsent(
        @PathVariable Long employeeId,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
    Optional<EmployeeModel> employee = empService.getEmployeeById(employeeId);
    if (!employee.isPresent()) {
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
    
    if (attService.hasAttendanceForDate(employee.get(), date)) {
        return new ResponseEntity<>(HttpStatus.CONFLICT);
    }
    
    attService.markAbsent(employee.get(), date);
    return new ResponseEntity<>(HttpStatus.OK);
}
}
