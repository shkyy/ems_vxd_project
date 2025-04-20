package ems.app.service;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import ems.app.model.AttendanceModel;
import ems.app.model.EmployeeModel;
import ems.app.repo.AttendanceRepo;
import jakarta.transaction.Transactional;

@Service
public class AttendanceService {
    private final AttendanceRepo repo;

    @Autowired
    public AttendanceService(AttendanceRepo repo) {
        this.repo = repo;
    }

    public List<AttendanceModel> getALlAttendances() {
        return repo.findAll();
    }

    public Optional<AttendanceModel> getAttendanceById(Long id) {
        return repo.findById(id);
    }

    public List<AttendanceModel> getAttendanceByEmployee(EmployeeModel employee) {
        return repo.findByEmployee(employee);
    }

    public List<AttendanceModel> getAttendanceByDate(LocalDate date) {
        return repo.findByDate(date);
    }

    public List<AttendanceModel> getAttendanceByEmployeeAndDateRange(
        EmployeeModel employee, LocalDate startDate, LocalDate endDate) {
            return repo.findByEmployeeAndDateBetween(employee, startDate, endDate);
    }

    public List<AttendanceModel> getAttendanceByEmployeeAndStatus(EmployeeModel employee, String status) {
        return repo.findByEmployeeAndStatus(employee, status);
    }

    @Transactional
    public AttendanceModel saveAttedance(AttendanceModel attendance) {
        // Calculate working hours if both clock in and clock out are provided
        if (attendance.getClockIn() != null && attendance.getClockOut() != null) {
            Duration duration = Duration.between(attendance.getClockIn(), attendance.getClockOut());
            double hours = duration.toMinutes() / 60.0;
            attendance.setWorkingHrs(BigDecimal.valueOf(hours));
        }

        return repo.save(attendance);
    }


    @Transactional
    public AttendanceModel clockIn(EmployeeModel employee, LocalDate date, LocalDate time) {
        List<AttendanceModel> attendances = repo.findByEmployeeAndDate(employee, date);

        AttendanceModel attendance;
        if (attendances.isEmpty()) {
            attendance = new AttendanceModel();
            attendance.setEmployee(employee);
            attendance.setDate(date);
            attendance.setStatus("PRESENT");
        } else {
            attendance = attendances.get(0);
        }

        attendance.setClockIn(time);
        return repo.save(attendance);
    }

    @Transactional
    public AttendanceModel clockOut(EmployeeModel employee, LocalDate date, LocalDate time) {
        List<AttendanceModel> attendances = repo.findByEmployeeAndDate(employee, date);

        if (attendances.isEmpty()) {
            throw new RuntimeException("No clock-in record found for this employee on this date");
        }

        AttendanceModel attendance = attendances.get(0);
        attendance.setClockOut(time);

        // Calculate working hours
        if (attendance.getClockIn() != null) {
            Duration duration = Duration.between(attendance.getClockIn(), time);
            double hours = duration.toMinutes() / 60.0;
            attendance.setWorkingHrs(BigDecimal.valueOf(hours));
        }

        return repo.save(attendance);
    }

    @Transactional
    public AttendanceModel updateAttendanceStatus(Long id, String status) {
        Optional<AttendanceModel> attendanceOpt = repo.findById(id);
        if(attendanceOpt.isPresent()) {
            AttendanceModel attendance = attendanceOpt.get();
            attendance.setStatus(status);
            return repo.save(attendance);
        }

        throw new RuntimeException("Attendance record not found");
    }

    @Transactional
    public void deleteAttendance(Long id) {
        repo.deleteById(id);
    }

    public boolean hasAttendanceForDate(EmployeeModel employee, LocalDate date) {
        List<AttendanceModel> attendances = repo.findByEmployeeAndDate(employee, date);
        return !attendances.isEmpty();
    }

    @Transactional
    public void markAbsent(EmployeeModel employee, LocalDate date) {
        List<AttendanceModel> attendances = repo.findByEmployeeAndDate(employee, date);

        AttendanceModel attendance;
        if(attendances.isEmpty()) {
            attendance = new AttendanceModel();
            attendance.setEmployee(employee);
            attendance.setDate(date);
        } else {
            attendance = attendances.get(0);
        }

        attendance.setStatus("ABSENT");
        repo.save(attendance);
    }

}
