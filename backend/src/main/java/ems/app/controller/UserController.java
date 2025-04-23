package ems.app.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import ems.app.model.EmployeeModel;
import ems.app.model.UserModel;
import ems.app.service.EmployeeService;
import ems.app.service.UserService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/users")
public class UserController {
    
    private final UserService usrService;
    private final EmployeeService empService;
    
    @Autowired
    public UserController(UserService usrService, EmployeeService empService) {
        this.usrService = usrService;
        this.empService = empService;
    }
    
    @GetMapping
    public ResponseEntity<List<UserModel>> getAllUsers() {
        List<UserModel> users = usrService.getAllUsers();
        return new ResponseEntity<>(users, HttpStatus.OK);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<UserModel> getUserById(@PathVariable Long id) {
        Optional<UserModel> user = usrService.getUserById(id);
        return user.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
    
    @GetMapping("/username/{username}")
    public ResponseEntity<UserModel> getUserByUsername(@PathVariable String username) {
        Optional<UserModel> user = usrService.getUserByUsername(username);
        return user.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
    
    @GetMapping("/email/{email}")
    public ResponseEntity<UserModel> getUserByEmail(@PathVariable String email) {
        Optional<UserModel> user = usrService.getUserByEmail(email);
        return user.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
    
    @GetMapping("/role/{role}")
    public ResponseEntity<List<UserModel>> getUsersByRole(@PathVariable String role) {
        List<UserModel> users = usrService.getUsersByRole(role);
        return new ResponseEntity<>(users, HttpStatus.OK);
    }
    
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody UserModel user) {
        try {
            UserModel registeredUser = usrService.registerUser(user);
            return new ResponseEntity<>(registeredUser, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(Map.of("message", e.getMessage()), HttpStatus.BAD_REQUEST);
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");
        
        if (username == null || password == null) {
            return new ResponseEntity<>(Map.of("message", "Username and password are required"), 
                    HttpStatus.BAD_REQUEST);
        }
        
        boolean isAuthenticated = usrService.authenticate(username, password);
        if (isAuthenticated) {
            Optional<UserModel> user = usrService.getUserByUsername(username);
            return new ResponseEntity<>(user.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(Map.of("message", "Invalid credentials"), 
                    HttpStatus.UNAUTHORIZED);
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @Valid @RequestBody UserModel user) {
        if (!usrService.getUserById(id).isPresent()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        user.setUserId(id);
        UserModel updatedUser = usrService.updateUser(user);
        return new ResponseEntity<>(updatedUser, HttpStatus.OK);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        if (!usrService.getUserById(id).isPresent()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        usrService.deleteUser(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
    
    @PutMapping("/{userId}/status/{status}")
    public ResponseEntity<UserModel> updateUserStatus(@PathVariable Long userId, @PathVariable String status) {
        try {
            UserModel user = usrService.updateStatus(userId, status);
            return new ResponseEntity<>(user, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    @PutMapping("/{userId}/role/{role}")
    public ResponseEntity<UserModel> assignRole(@PathVariable Long userId, @PathVariable String role) {
        try {
            UserModel user = usrService.assignRole(userId, role);
            return new ResponseEntity<>(user, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    @PutMapping("/{userId}/employee/{employeeId}")
    public ResponseEntity<UserModel> linkToEmployee(@PathVariable Long userId, @PathVariable Long employeeId) {
        Optional<EmployeeModel> employee = empService.getEmployeeById(employeeId);
        if (!employee.isPresent()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        try {
            UserModel user = usrService.linkToEmployee(userId, employee.get());
            return new ResponseEntity<>(user, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}