package com.dayflow.hrms.service.impl;

import com.dayflow.hrms.dto.EmployeeDto;
import com.dayflow.hrms.entity.AppUser;
import com.dayflow.hrms.entity.Employee;
import com.dayflow.hrms.entity.Role;
import com.dayflow.hrms.repository.AppUserRepository;
import com.dayflow.hrms.repository.EmployeeRepository;
import com.dayflow.hrms.service.EmployeeService;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    public EmployeeServiceImpl(EmployeeRepository employeeRepository,
                               AppUserRepository appUserRepository,
                               PasswordEncoder passwordEncoder) {
        this.employeeRepository = employeeRepository;
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public List<EmployeeDto> listAll() {
        return employeeRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public List<EmployeeDto> search(String query) {
        if (query == null || query.isBlank()) {
            return listAll();
        }
        return employeeRepository.search(query.trim()).stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public EmployeeDto getById(Long id) {
        return employeeRepository.findById(id).map(this::toDto).orElse(null);
    }

    @Override
    public EmployeeDto getByUsername(String username) {
        return employeeRepository.findByUserUsername(username).map(this::toDto).orElse(null);
    }

    @Override
    public EmployeeDto create(EmployeeDto dto) {
        String username = (dto.getFirstName().toLowerCase() + "." + dto.getLastName().toLowerCase()).replaceAll("\\s+", "");
        if (appUserRepository.existsByUsername(username)) {
            username = username + System.currentTimeMillis() % 1000;
        }
        String email = dto.getEmail() != null && !dto.getEmail().isBlank() ? dto.getEmail() : username + "@dayflow.local";

        Role role = Role.EMPLOYEE;
        if (dto.getRole() != null) {
            try {
                role = Role.valueOf(dto.getRole().toUpperCase());
            } catch (Exception ignored) {
            }
        }

        AppUser user = new AppUser(
                username,
                email,
                passwordEncoder.encode("dayflow123"),
                role
        );
        user.setEmailVerified(true);
        AppUser savedUser = appUserRepository.save(user);

        Employee e = new Employee();
        e.setUser(savedUser);
        e.setEmployeeCode(dto.getEmployeeCode() != null && !dto.getEmployeeCode().isBlank()
                ? dto.getEmployeeCode()
                : "DF-" + (1000 + savedUser.getId()));
        e.setFirstName(dto.getFirstName());
        e.setLastName(dto.getLastName() != null ? dto.getLastName() : "");
        e.setEmail(email);
        e.setPhone(dto.getPhone());
        e.setAddress(dto.getAddress());
        e.setEmergencyContact(dto.getEmergencyContact());
        e.setDepartment(dto.getDepartment() != null ? dto.getDepartment() : "Engineering");
        e.setJobTitle(dto.getJobTitle() != null ? dto.getJobTitle() : "Software Engineer");
        e.setEmploymentType(dto.getEmploymentType() != null ? dto.getEmploymentType() : "Full-time");
        e.setStatus(dto.getStatus() != null ? dto.getStatus() : "ACTIVE");
        e.setDateOfJoining(dto.getDateOfJoining() != null ? dto.getDateOfJoining() : LocalDate.now());
        e.setDateOfBirth(dto.getDateOfBirth());
        e.setBaseSalary(dto.getBaseSalary() != null ? dto.getBaseSalary() : BigDecimal.valueOf(60000));
        e.setProfilePhotoUrl(dto.getProfilePhotoUrl());

        Employee saved = employeeRepository.save(e);
        return toDto(saved);
    }

    @Override
    public EmployeeDto update(Long id, EmployeeDto dto) {
        return employeeRepository.findById(id).map(e -> {
            if (dto.getFirstName() != null) e.setFirstName(dto.getFirstName());
            if (dto.getLastName() != null) e.setLastName(dto.getLastName());
            if (dto.getEmail() != null) e.setEmail(dto.getEmail());
            if (dto.getPhone() != null) e.setPhone(dto.getPhone());
            if (dto.getAddress() != null) e.setAddress(dto.getAddress());
            if (dto.getEmergencyContact() != null) e.setEmergencyContact(dto.getEmergencyContact());
            if (dto.getDepartment() != null) e.setDepartment(dto.getDepartment());
            if (dto.getJobTitle() != null) e.setJobTitle(dto.getJobTitle());
            if (dto.getEmploymentType() != null) e.setEmploymentType(dto.getEmploymentType());
            if (dto.getStatus() != null) e.setStatus(dto.getStatus());
            if (dto.getDateOfJoining() != null) e.setDateOfJoining(dto.getDateOfJoining());
            if (dto.getDateOfBirth() != null) e.setDateOfBirth(dto.getDateOfBirth());
            if (dto.getBaseSalary() != null) e.setBaseSalary(dto.getBaseSalary());
            if (dto.getProfilePhotoUrl() != null) e.setProfilePhotoUrl(dto.getProfilePhotoUrl());

            if (dto.getRole() != null && e.getUser() != null) {
                try {
                    Role role = Role.valueOf(dto.getRole().toUpperCase());
                    e.getUser().setRole(role);
                    appUserRepository.save(e.getUser());
                } catch (Exception ignored) {
                }
            }

            Employee saved = employeeRepository.save(e);
            return toDto(saved);
        }).orElse(null);
    }

    @Override
    public EmployeeDto updateSelfProfile(String username, EmployeeDto dto) {
        return employeeRepository.findByUserUsername(username).map(e -> {
            // Employees can update limited fields: phone, address, emergencyContact, profilePhotoUrl
            if (dto.getPhone() != null) e.setPhone(dto.getPhone());
            if (dto.getAddress() != null) e.setAddress(dto.getAddress());
            if (dto.getEmergencyContact() != null) e.setEmergencyContact(dto.getEmergencyContact());
            if (dto.getProfilePhotoUrl() != null) e.setProfilePhotoUrl(dto.getProfilePhotoUrl());
            if (dto.getFirstName() != null && !dto.getFirstName().isBlank()) e.setFirstName(dto.getFirstName());
            if (dto.getLastName() != null) e.setLastName(dto.getLastName());

            Employee saved = employeeRepository.save(e);
            return toDto(saved);
        }).orElse(null);
    }

    @Override
    public void delete(Long id) {
        employeeRepository.deleteById(id);
    }

    private EmployeeDto toDto(Employee e) {
        EmployeeDto d = new EmployeeDto();
        d.setId(e.getId());
        d.setEmployeeCode(e.getEmployeeCode());
        d.setFirstName(e.getFirstName());
        d.setLastName(e.getLastName());
        d.setEmail(e.getEmail());
        d.setPhone(e.getPhone());
        d.setAddress(e.getAddress());
        d.setEmergencyContact(e.getEmergencyContact());
        d.setDepartment(e.getDepartment());
        d.setJobTitle(e.getJobTitle());
        d.setEmploymentType(e.getEmploymentType());
        d.setStatus(e.getStatus());
        d.setDateOfJoining(e.getDateOfJoining());
        d.setDateOfBirth(e.getDateOfBirth());
        d.setBaseSalary(e.getBaseSalary());
        d.setProfilePhotoUrl(e.getProfilePhotoUrl());
        if (e.getUser() != null) {
            d.setRole(e.getUser().getRole().name());
        }
        return d;
    }
}
