package com.dayflow.hrms.service;

import com.dayflow.hrms.dto.EmployeeDto;
import java.util.List;

public interface EmployeeService {
    List<EmployeeDto> listAll();
    EmployeeDto getById(Long id);
    EmployeeDto update(Long id, EmployeeDto dto);
}
