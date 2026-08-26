package com.dayflow.hrms.service;

import com.dayflow.hrms.auth.AuthResponse;
import com.dayflow.hrms.auth.LoginRequest;
import com.dayflow.hrms.auth.RegisterRequest;
import com.dayflow.hrms.config.JwtService;
import com.dayflow.hrms.entity.AppUser;
import com.dayflow.hrms.entity.Employee;
import com.dayflow.hrms.entity.Role;
import com.dayflow.hrms.repository.AppUserRepository;
import com.dayflow.hrms.repository.EmployeeRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final AppUserRepository appUserRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final EmailService emailService;

    public AuthService(AppUserRepository appUserRepository,
                       EmployeeRepository employeeRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtService jwtService,
                       EmailService emailService) {
        this.appUserRepository = appUserRepository;
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.emailService = emailService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (appUserRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (appUserRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        Role assignedRole = request.getRole() != null ? request.getRole() : Role.EMPLOYEE;

        AppUser user = new AppUser(
                request.getUsername(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                assignedRole
        );
        user.setEmailVerified(true);
        AppUser savedUser = appUserRepository.save(user);

        String empCode = "DF-" + (1000 + savedUser.getId());
        Employee employee = new Employee(
                empCode,
                savedUser.getUsername(),
                "",
                savedUser.getEmail(),
                savedUser
        );
        employee.setDepartment(assignedRole == Role.EMPLOYEE ? "Engineering" : "Human Resources");
        employee.setJobTitle(assignedRole == Role.EMPLOYEE ? "Associate Engineer" : "HR Specialist");
        Employee savedEmp = employeeRepository.save(employee);

        emailService.sendWelcomeNotification(savedUser.getEmail(), savedUser.getUsername(), empCode);

        String token = jwtService.generateToken(savedUser);
        return new AuthResponse(
                token,
                savedUser.getUsername(),
                savedUser.getEmail(),
                savedUser.getRole().name(),
                savedEmp.getId(),
                savedEmp.getFirstName() + (savedEmp.getLastName().isBlank() ? "" : " " + savedEmp.getLastName())
        );
    }

    public AuthResponse login(LoginRequest request) {
        try {
            // Check if username passed is actually an email
            String actualUsername = request.getUsername();
            if (request.getUsername().contains("@")) {
                var userOpt = appUserRepository.findByEmail(request.getUsername());
                if (userOpt.isPresent()) {
                    actualUsername = userOpt.get().getUsername();
                }
            }

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(actualUsername, request.getPassword())
            );

            if (!authentication.isAuthenticated()) {
                throw new AuthenticationException("Authentication failed") {};
            }

            AppUser user = appUserRepository.findByUsername(actualUsername)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            Employee emp = employeeRepository.findByUserUsername(user.getUsername()).orElse(null);
            Long empId = emp != null ? emp.getId() : null;
            String fullName = emp != null ? (emp.getFirstName() + " " + emp.getLastName()).trim() : user.getUsername();

            String token = jwtService.generateToken(user);
            return new AuthResponse(
                    token,
                    user.getUsername(),
                    user.getEmail(),
                    user.getRole().name(),
                    empId,
                    fullName
            );
        } catch (AuthenticationException e) {
            throw new IllegalArgumentException("Invalid username or password", e);
        }
    }
}
