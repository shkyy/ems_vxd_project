package ems.app.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import ems.app.model.DepartmentModel;
import ems.app.model.EmployeeModel;
import ems.app.repo.EmployeeRepo;
import jakarta.transaction.Transactional;


@Service
public class EmployeeService {
    private final EmployeeRepo repo;

    @Autowired
    public EmployeeService(EmployeeRepo repo) {
        this.repo = repo;
    }

    public List<EmployeeModel> getAllEmployees() {
        return repo.findAll();
    }

    public Optional<EmployeeModel> getEmployeeById(Long id) {
        return repo.findById(id);
    }

    public Optional<EmployeeModel> getEmployeeByEmail(String email) {
        return repo.findByEmail(email);
    }

    public List<EmployeeModel> getEmployeesByDepartment(DepartmentModel department) {
        return repo.findByDepartment(department);
    }

    public List<EmployeeModel> getEmployeesByJobTitile(String jobTitle) {
        return repo.findByJobTitle(jobTitle);
    }

    public List<EmployeeModel> getEmployeeByStatus(String status) {
        return repo.findByStatus(status);
    }

    public List<EmployeeModel> getEmployeeByHiredBetween(LocalDate startDate, LocalDate endDate) {
        return repo.findEmployeesHiredBetween(startDate, endDate);
    }

    public List<EmployeeModel> searchEmployeeByName(String keyword) {
        return repo.searchByName(keyword);
    } 

    @Transactional
    public EmployeeModel saveEmployee(EmployeeModel employee) {
        return repo.save(employee);
    }

    @Transactional
    public EmployeeModel updateEmployee(EmployeeModel employee) {
        return repo.save(employee);
    }

    @Transactional
    public void deleteEmployee(Long id) {
        repo.deleteById(id);
    }

    @Transactional
    public EmployeeModel assignManager(Long employeeId, EmployeeModel manager) {
        Optional<EmployeeModel> employeeOpt = repo.findById(employeeId);
        if (employeeOpt.isPresent()) {
            EmployeeModel employee = employeeOpt.get();
            employee.setManager(manager);
            return repo.save(employee);
        }
        throw new RuntimeException("Employee not found");
    }

    @Transactional
    public EmployeeModel assignDepartment(Long employeeId, DepartmentModel department) {
        Optional<EmployeeModel> employeeOpt = repo.findById(employeeId);
        if (employeeOpt.isPresent()) {
            EmployeeModel employee = employeeOpt.get();
            employee.setDepartment(department);
            return repo.save(employee);
        }
        throw new RuntimeException("Employee not found");
    }

    @Transactional
    public EmployeeModel updateStatus(Long employeeId, String status) {
        Optional<EmployeeModel> employeeOpt = repo.findById(employeeId);
        if (employeeOpt.isPresent()) {
            EmployeeModel employee = employeeOpt.get();
            employee.setStatus(status);
            return repo.save(employee);
        }
        throw new RuntimeException("Employee not found");
    }
}
