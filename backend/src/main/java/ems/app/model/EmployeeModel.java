package ems.app.model;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "employee")
@Data
public class EmployeeModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "employee_id")
    private Long employeeId;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "contact_number")
    private String contactNo;

    @Column(name = "hire_date", nullable = false)
    private LocalDate hiredDate;

    @Column(name = "job_title", nullable = false)
    private String jobTitle;

    @Column(name = "salary")
    private BigDecimal salary;
    
    @Column(name = "address")
    private String address;
    
    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;
    
    @Column(name = "gender")
    private String gender;
    
    @Column(name = "status", length = 20)
    private String status = "ACTIVE";

    @ManyToOne
    @JoinColumn(name = "department_id")
    private DepartmentModel department;

    @ManyToOne
    @JoinColumn(name = "manager_id")
    private EmployeeModel manager;

    @OneToMany(mappedBy = "manager")
    private Set<EmployeeModel> subordinates = new HashSet<>();

    @OneToMany(mappedBy = "employee")
    private Set<AttendanceModel> attendances = new HashSet<>();

    @OneToMany(mappedBy = "employee")
    private Set<LeaveModel> leaves = new HashSet<>();
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
