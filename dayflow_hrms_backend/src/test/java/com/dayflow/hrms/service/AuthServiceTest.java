package com.dayflow.hrms.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.dayflow.hrms.auth.AuthResponse;
import com.dayflow.hrms.auth.LoginRequest;
import com.dayflow.hrms.auth.RegisterRequest;
import com.dayflow.hrms.config.JwtService;
import com.dayflow.hrms.entity.AppUser;
import com.dayflow.hrms.entity.Employee;
import com.dayflow.hrms.entity.Role;
import com.dayflow.hrms.repository.AppUserRepository;
import com.dayflow.hrms.repository.EmployeeRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AppUserRepository appUserRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private EmailService emailService;

    private JwtService jwtService;
    private AuthService authService;

    private AppUser sampleUser;
    private Employee sampleEmployee;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secret", "dayflow-super-secret-key-for-local-dev-change-me-dayflow-hrms-key-at-least-256-bits");
        ReflectionTestUtils.setField(jwtService, "expirationMs", 3600000L);

        authService = new AuthService(
                appUserRepository,
                employeeRepository,
                passwordEncoder,
                authenticationManager,
                jwtService,
                emailService
        );

        sampleUser = new AppUser("testuser", "test@dayflow.local", "encodedPass", Role.EMPLOYEE);
        sampleUser.setId(1L);

        sampleEmployee = new Employee("DF-1001", "Test", "User", "test@dayflow.local", sampleUser);
        sampleEmployee.setId(10L);
    }

    @Test
    void register_Success() {
        RegisterRequest req = new RegisterRequest();
        req.setUsername("newuser");
        req.setEmail("newuser@dayflow.local");
        req.setPassword("pass123");
        req.setRole(Role.EMPLOYEE);

        when(appUserRepository.existsByUsername("newuser")).thenReturn(false);
        when(appUserRepository.existsByEmail("newuser@dayflow.local")).thenReturn(false);
        when(passwordEncoder.encode("pass123")).thenReturn("encodedPass");
        when(appUserRepository.save(any(AppUser.class))).thenReturn(sampleUser);
        when(employeeRepository.save(any(Employee.class))).thenReturn(sampleEmployee);

        AuthResponse resp = authService.register(req);

        assertNotNull(resp);
        assertNotNull(resp.getToken());
        assertEquals("testuser", resp.getUsername());
        assertEquals("EMPLOYEE", resp.getRole());
        verify(emailService, times(1)).sendWelcomeNotification(anyString(), anyString(), anyString());
    }

    @Test
    void register_DuplicateUsername_ThrowsException() {
        RegisterRequest req = new RegisterRequest();
        req.setUsername("existing");
        req.setEmail("existing@dayflow.local");
        req.setPassword("pass");

        when(appUserRepository.existsByUsername("existing")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> authService.register(req));
    }

    @Test
    void login_Success() {
        LoginRequest req = new LoginRequest();
        req.setUsername("testuser");
        req.setPassword("pass123");

        Authentication mockAuth = mock(Authentication.class);
        when(mockAuth.isAuthenticated()).thenReturn(true);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(mockAuth);
        when(appUserRepository.findByUsername("testuser")).thenReturn(Optional.of(sampleUser));
        when(employeeRepository.findByUserUsername("testuser")).thenReturn(Optional.of(sampleEmployee));

        AuthResponse resp = authService.login(req);

        assertNotNull(resp);
        assertNotNull(resp.getToken());
        assertEquals("testuser", resp.getUsername());
    }
}
