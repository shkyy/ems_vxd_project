package ems.app.repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import ems.app.model.DepartmentModel;
import java.util.List;


@Repository
public interface DepartmentRepo extends JpaRepository<DepartmentModel, Long> {
    Optional<DepartmentModel> findByDepartmentName(String departmentName);
    List<DepartmentModel> findByLocation(String location);
}