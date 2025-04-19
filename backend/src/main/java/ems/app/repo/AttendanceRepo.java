package ems.app.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import ems.app.model.AttendanceModel;
import ems.app.model.EmployeeModel;
import java.time.LocalDate;


@Repository
public interface AttendanceRepo extends JpaRepository<AttendanceModel, Long> {
    List<AttendanceModel> findByEmployee(EmployeeModel employee);
    List<AttendanceModel> findByDate(LocalDate date);
    List<AttendanceModel> findByEmployeeAndDate(EmployeeModel employee, LocalDate date);

    @Query("SELECT atd FROM AttendanceModel atd WHERE atd.employee = :employee AND atd.date BETWEEN :startDate AND :endDate")
    List<AttendanceModel> findByEmployeeAndDateBetween(
        @Param("employee") EmployeeModel employee,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    @Query("SELECT atd FROM AttendanceModel atd WHERE atd.employee = :employee AND atd.status = :status")
    List<AttendanceModel> findByEmployeeAndStatus(
        @Param("employee") EmployeeModel employee,
        @Param("status") String status
    );
}
