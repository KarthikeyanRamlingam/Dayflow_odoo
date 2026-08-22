package com.dayflow.hrms.service.impl;

import com.dayflow.hrms.dto.EmployeeDto;
import com.dayflow.hrms.entity.Employee;
import com.dayflow.hrms.repository.EmployeeRepository;
import com.dayflow.hrms.service.EmployeeService;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;

    public EmployeeServiceImpl(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    @Override
    public List<EmployeeDto> listAll() {
        return employeeRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public EmployeeDto getById(Long id) {
        return employeeRepository.findById(id).map(this::toDto).orElse(null);
    }

    @Override
    public EmployeeDto update(Long id, EmployeeDto dto) {
        return employeeRepository.findById(id).map(e -> {
            e.setFirstName(dto.getFirstName());
            e.setLastName(dto.getLastName());
            e.setEmail(dto.getEmail());
            e.setPhone(dto.getPhone());
            e.setDepartment(dto.getDepartment());
            e.setJobTitle(dto.getJobTitle());
            e.setStatus(dto.getStatus());
            e.setProfilePhotoUrl(dto.getProfilePhotoUrl());
            Employee saved = employeeRepository.save(e);
            return toDto(saved);
        }).orElse(null);
    }

    private EmployeeDto toDto(Employee e) {
        EmployeeDto d = new EmployeeDto();
        d.setId(e.getId());
        d.setEmployeeCode(e.getEmployeeCode());
        d.setFirstName(e.getFirstName());
        d.setLastName(e.getLastName());
        d.setEmail(e.getEmail());
        d.setPhone(e.getPhone());
        d.setDepartment(e.getDepartment());
        d.setJobTitle(e.getJobTitle());
        d.setStatus(e.getStatus());
        d.setProfilePhotoUrl(e.getProfilePhotoUrl());
        return d;
    }
}
