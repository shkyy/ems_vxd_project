package ems.app.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import ems.app.model.EmployeeModel;
import ems.app.model.LeaveModel;
import java.util.List;
import java.time.LocalDate;

@Repository
public interface LeaveRepo extends JpaRepository<LeaveModel, Long> {
    List<LeaveModel> findByEmployee(EmployeeModel employee);
    List<LeaveModel> findByStatus(String status);
    List<LeaveModel> findByLeaveType(LocalDate leaveType);

    @Query("SELECT lv FROM LeaveModel lv WHERE lv.employee = :employee AND lv.status = :status")
    List<LeaveModel> findByEmployeeAndStatus(
        @Param("employee") EmployeeModel employee,
        @Param("status") String status
    );

    @Query("SELECT lv FROM LeaveModel lv WHERE lv.startDate <= :date AND lv.endDate >= :date")
    List<LeaveModel> findLeavesForDate(@Param("date") LocalDate date);

    @Query("SELECT lv FROM LeaveModel lv WHERE lv.employee = :employee AND" +
        "((lv.startDate BETWEEN :startDate AND :endDate) OR" + 
        "(lv.endDate BETWEEN :startDate AND :endDate) OR" +
        "(lv.startDate <= :startDate AND lv.endDate >= :endDate))")
    List<LeaveModel> findOverlappingLeaves (
        @Param("employee") EmployeeModel employee,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
}
