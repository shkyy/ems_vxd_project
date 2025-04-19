package ems.app.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import ems.app.model.DepartmentModel;
import ems.app.model.EmployeeModel;
import ems.app.repo.DepartmentRepo;
import jakarta.transaction.Transactional;

@Service
public class DepartmentService {
    private final DepartmentRepo repo;

    @Autowired
    public DepartmentService(DepartmentRepo repo) {
        this.repo = repo;
    }

    public List<DepartmentModel> getAllDepartments() {
        return repo.findAll();
    }

    public Optional<DepartmentModel> getDepartmentById(Long id) {
        return repo.findById(id);
    }

    public Optional<DepartmentModel> getDepartmentByName(String name) {
        return repo.findByDepartmentName(name);
    }

    public List<DepartmentModel> getDepartmentByLocation(String location) {
        return repo.findByLocation(location);
    }

    @Transactional
    public DepartmentModel saveDepartment(DepartmentModel department) {
        return repo.save(department);
    }

    @Transactional
    public DepartmentModel updateDepartment(DepartmentModel department) {
        return repo.save(department);
    }

    @Transactional
    public void deleteDepartment(Long id) {
        repo.deleteById(id);
    }

    @Transactional
    public DepartmentModel assignManager(Long deptId, EmployeeModel manager) {
        Optional<DepartmentModel> deptOpt = repo.findById(deptId);
        if (deptOpt.isPresent()) {
            DepartmentModel department = deptOpt.get();
            department.setManager(manager);
            return repo.save(department);
        }
        throw new RuntimeException("Department not found");
    }
}
