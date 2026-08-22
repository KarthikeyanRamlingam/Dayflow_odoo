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

@Service
public class AuthService {

    private final AppUserRepository appUserRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(AppUserRepository appUserRepository,
                       EmployeeRepository employeeRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtService jwtService) {
        this.appUserRepository = appUserRepository;
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {
        if (appUserRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (appUserRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        AppUser user = new AppUser(
                request.getUsername(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getRole() == null ? Role.EMPLOYEE : request.getRole()
        );

        AppUser savedUser = appUserRepository.save(user);

        Employee employee = new Employee(
                "DF-" + savedUser.getId(),
                "New",
                savedUser.getUsername(),
                savedUser.getEmail(),
                savedUser
        );
        employeeRepository.save(employee);

        String token = jwtService.generateToken(savedUser);
        return new AuthResponse(token, savedUser.getUsername(), savedUser.getRole().name());
    }

    public AuthResponse login(LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );

            if (!authentication.isAuthenticated()) {
                throw new AuthenticationException("Authentication failed") {
                };
            }

            AppUser user = appUserRepository.findByUsername(request.getUsername())
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            String token = jwtService.generateToken(user);
            return new AuthResponse(token, user.getUsername(), user.getRole().name());
        } catch (AuthenticationException e) {
            throw new IllegalArgumentException("Invalid username or password", e);
        }
    }
}
