package ems.app.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import ems.app.model.EmployeeModel;
import ems.app.model.LeaveModel;
import ems.app.repo.LeaveRepo;
import jakarta.transaction.Transactional;

@Service
public class LeaveService {
    private final LeaveRepo repo;

    @Autowired
    public LeaveService(LeaveRepo repo) {
        this.repo = repo;
    }

    public List<LeaveModel> getAllLeaves() {
        return repo.findAll();
    }

    public Optional<LeaveModel> getLeaveById(Long id) {
        return repo.findById(id);
    }

    public List<LeaveModel> getLeaveByEmployee(EmployeeModel employee) {
        return repo.findByEmployee(employee);
    }

    public List<LeaveModel> getLeaveByStatus(String status) {
        return repo.findByStatus(status);
    }

    public List<LeaveModel> getLeavesForDate(LocalDate date) {
        return repo.findLeavesForDate(date);
    }

    public boolean hasOverlappingLeaves(EmployeeModel employee, LocalDate startDate, LocalDate endDate) {
        List<LeaveModel> overlappingLeaves = repo.findOverlappingLeaves(employee, startDate, endDate);
        return !overlappingLeaves.isEmpty();
    }

    @Transactional
    public LeaveModel applyForLeave(LeaveModel leave) {
        // Calculate total days
        long days = ChronoUnit.DAYS.between(leave.getStartDate(), leave.getEndDate()) + 1;
        leave.setTotaldays((int) days);

        // Check for overlapping leaves
        if (hasOverlappingLeaves(leave.getEmployee(), leave.getStartDate(), leave.getEndDate())) {
            throw new RuntimeException("Employee already has approved/pending leave for this period");
        }

        // Set initial status
        leave.setStatus("PENDING");

        return repo.save(leave);
    }

    @Transactional
    public LeaveModel approveLeave(Long id, EmployeeModel approver) {
        Optional<LeaveModel> leaveOpt = repo.findById(id);
        if(leaveOpt.isPresent()) {
            LeaveModel leave = leaveOpt.get();
            leave.setStatus("APPROVED");
            leave.setApprovedBy(approver);
            leave.setApprovalDate(LocalDateTime.now());
            return repo.save(leave);
        }
        throw new RuntimeException("Leave request not found");
    }


    @Transactional
    public LeaveModel rejectedLeave(Long id, EmployeeModel reviewer) {
        Optional<LeaveModel> leaveOpt = repo.findById(id);

        if(leaveOpt.isPresent()) {
            LeaveModel leave = leaveOpt.get();
            leave.setStatus("REJECTED");
            leave.setApprovedBy(reviewer);
            leave.setApprovalDate(LocalDateTime.now());
            return repo.save(leave);
        }
        throw new RuntimeException("Leave Request not found");
    }


    @Transactional
    public LeaveModel cancelLeave(Long id) {
        Optional<LeaveModel> leaveOpt = repo.findById(id);

        if(leaveOpt.isPresent()) {
            LeaveModel leave = leaveOpt.get();
            leave.setStatus("CANCELED");
            leave.setApprovalDate(LocalDateTime.now());
            return repo.save(leave);
        }
        throw new RuntimeException("Leave Request not found");
    }

    @Transactional
    public void deleteLeave(Long id) {
        repo.deleteById(id);
    }

    public int getUsedLeavesByTypeAndYear(EmployeeModel employee, String type, int year) {
        LocalDate startOfYear = LocalDate.of(year, 1, 1);
        LocalDate endOfYear = LocalDate.of(year, 12, 31);

        List<LeaveModel> leaves = repo.findOverlappingLeaves(employee, startOfYear, endOfYear);
        return leaves.stream()
            .filter(leave -> leave.getLeaveType().equals(type) && (leave.getStatus().equals("APPROVED") || leave.getStatus().equals("PENDING")))
            .mapToInt(LeaveModel::getTotaldays)
            .sum();
    }
}
