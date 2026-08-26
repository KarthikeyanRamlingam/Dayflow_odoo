package com.dayflow.hrms.service;

import com.dayflow.hrms.dto.EmployeeDto;
import java.util.List;

public interface EmployeeService {
    List<EmployeeDto> listAll();
    List<EmployeeDto> search(String query);
    EmployeeDto getById(Long id);
    EmployeeDto getByUsername(String username);
    EmployeeDto create(EmployeeDto dto);
    EmployeeDto update(Long id, EmployeeDto dto);
    EmployeeDto updateSelfProfile(String username, EmployeeDto dto);
    void delete(Long id);
}
