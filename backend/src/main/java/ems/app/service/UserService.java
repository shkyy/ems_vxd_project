package ems.app.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import ems.app.model.EmployeeModel;
import ems.app.model.UserModel;
import ems.app.repo.UserRepo;
import jakarta.transaction.Transactional;

@Service
public class UserService {
    private final UserRepo repo;
    
    @Autowired
    public UserService(UserRepo repo) {
        this.repo = repo;
    }
    
    public List<UserModel> getAllUsers() {
        return repo.findAll();
    }
    
    public Optional<UserModel> getUserById(Long id) {
        return repo.findById(id);
    }
    
    public Optional<UserModel> getUserByUsername(String username) {
        return repo.findByUsername(username);
    }

    public Optional<UserModel> getUserByEmail(String email) {
        return repo.findByEmail(email);
    }
    
    public List<UserModel> getUsersByRole(String role) {
        return repo.findByRole(role);
    }
    
    public Optional<UserModel> getUserByEmployee(EmployeeModel employee) {
        return repo.findByEmployee(employee);
    }

    @Transactional
    public UserModel registerUser(UserModel user) {
        if (repo.findByUsername(user.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }
        
        if (repo.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email already in use");
        }
    
        return repo.save(user);
    }

    @Transactional
    public UserModel updateUser(UserModel user) {
        return repo.save(user);
    }
    
    @Transactional
    public void deleteUser(Long id) {
        repo.deleteById(id);
    }
    
    @Transactional
    public UserModel updateStatus(Long userId, String status) {
        Optional<UserModel> userOpt = repo.findById(userId);
        if (userOpt.isPresent()) {
            UserModel user = userOpt.get();
            user.setStatus(status);
            return repo.save(user);
        }
        throw new RuntimeException("User not found");
    }


    @Transactional
    public UserModel assignRole(Long userId, String role) {
        Optional<UserModel> userOpt = repo.findById(userId);
        if (userOpt.isPresent()) {
            UserModel user = userOpt.get();
            user.setRole(role);
            return repo.save(user);
        }
        throw new RuntimeException("User not found");
    }
    
    @Transactional
    public UserModel linkToEmployee(Long userId, EmployeeModel employee) {
        Optional<UserModel> userOpt = repo.findById(userId);
        if (userOpt.isPresent()) {
            UserModel user = userOpt.get();
            user.setEmployee(employee);
            return repo.save(user);
        }
        throw new RuntimeException("User not found");
    }


    public boolean authenticate(String username, String password) {
        Optional<UserModel> userOpt = repo.findByUsername(username);
        if (userOpt.isPresent()) {
            UserModel user = userOpt.get();
            return user.getPassword().equals(password) && "ACTIVE".equals(user.getStatus());
        }
        return false;
    }


}
