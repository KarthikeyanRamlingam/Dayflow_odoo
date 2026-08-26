package com.dayflow.hrms.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.dayflow.hrms.dto.EmployeeDto;
import com.dayflow.hrms.entity.AppUser;
import com.dayflow.hrms.entity.Employee;
import com.dayflow.hrms.entity.Role;
import com.dayflow.hrms.repository.AppUserRepository;
import com.dayflow.hrms.repository.EmployeeRepository;
import com.dayflow.hrms.service.impl.EmployeeServiceImpl;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private AppUserRepository appUserRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private EmployeeServiceImpl employeeService;

    private Employee employee;
    private AppUser user;

    @BeforeEach
    void setUp() {
        user = new AppUser("jdoe", "jdoe@dayflow.local", "encoded", Role.EMPLOYEE);
        user.setId(5L);

        employee = new Employee("DF-105", "John", "Doe", "jdoe@dayflow.local", user);
        employee.setId(100L);
        employee.setDepartment("Engineering");
        employee.setJobTitle("Full Stack Engineer");
        employee.setBaseSalary(BigDecimal.valueOf(85000));
    }

    @Test
    void listAll_ReturnsListOfDto() {
        when(employeeRepository.findAll()).thenReturn(List.of(employee));

        List<EmployeeDto> list = employeeService.listAll();

        assertNotNull(list);
        assertEquals(1, list.size());
        assertEquals("DF-105", list.get(0).getEmployeeCode());
        assertEquals("John", list.get(0).getFirstName());
    }

    @Test
    void getById_Found_ReturnsDto() {
        when(employeeRepository.findById(100L)).thenReturn(Optional.of(employee));

        EmployeeDto dto = employeeService.getById(100L);

        assertNotNull(dto);
        assertEquals("John", dto.getFirstName());
        assertEquals("Doe", dto.getLastName());
    }

    @Test
    void updateSelfProfile_UpdatesContactDetails() {
        when(employeeRepository.findByUserUsername("jdoe")).thenReturn(Optional.of(employee));
        when(employeeRepository.save(any(Employee.class))).thenAnswer(i -> i.getArgument(0));

        EmployeeDto updatePayload = new EmployeeDto();
        updatePayload.setPhone("+1 (555) 999-8888");
        updatePayload.setAddress("New Address 123");

        EmployeeDto result = employeeService.updateSelfProfile("jdoe", updatePayload);

        assertNotNull(result);
        assertEquals("+1 (555) 999-8888", result.getPhone());
        assertEquals("New Address 123", result.getAddress());
    }
}
