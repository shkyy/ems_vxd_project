package ems.app.repo;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import ems.app.model.DepartmentModel;
import ems.app.model.EmployeeModel;

@Repository
public interface EmployeeRepo extends JpaRepository<EmployeeModel, Long> {
    Optional<EmployeeModel> findByEmail(String email);
    List<EmployeeModel> findByDepartment(DepartmentModel department);
    List<EmployeeModel> findByJobTitle(String jobTitle);
    List<EmployeeModel> findByStatus(String status);

    @Query("SELECT emp FROM EmployeeModel emp WHERE emp.hiredDate BETWEEN :startDate AND :endDate")
    List<EmployeeModel> findEmployeesHiredBetween(@Param("startDate") LocalDate starDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT emp FROM EmployeeModel emp WHERE LOWER(emp.firstName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(emp.lastName) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<EmployeeModel> searchByName(@Param("keyword") String keyword);
}
