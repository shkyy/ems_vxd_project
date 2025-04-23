package ems.app.repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import ems.app.model.EmployeeModel;
import ems.app.model.UserModel;

@Repository
public interface UserRepo extends JpaRepository<UserModel, Long> {
    Optional<UserModel> findByUsername(String username);
    Optional<UserModel> findByEmail(String email);
    List<UserModel> findByRole(String role);
    List<UserModel> findByStatus(String status);
    Optional<UserModel> findByEmployee(EmployeeModel employee);
}
