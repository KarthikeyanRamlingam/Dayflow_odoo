package com.dayflow.hrms;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.dayflow.hrms.config.JwtService;
import com.dayflow.hrms.entity.AppUser;
import com.dayflow.hrms.entity.Employee;
import com.dayflow.hrms.entity.Role;
import com.dayflow.hrms.repository.AppUserRepository;
import com.dayflow.hrms.repository.AttendanceRepository;
import com.dayflow.hrms.repository.EmployeeRepository;
import com.dayflow.hrms.repository.LeaveRequestRepository;
import com.dayflow.hrms.repository.PayrollRepository;
import com.dayflow.hrms.service.EmailService;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class HrControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AppUserRepository appUserRepository;

    @MockBean
    private EmployeeRepository employeeRepository;

    @MockBean
    private AttendanceRepository attendanceRepository;

    @MockBean
    private LeaveRequestRepository leaveRequestRepository;

    @MockBean
    private PayrollRepository payrollRepository;

    @MockBean
    private EmailService emailService;

    private AppUser adminUser;
    private Employee adminEmployee;

    @BeforeEach
    void setUp() {
        adminUser = new AppUser("admin", "admin@dayflow.local", "encoded", Role.ADMIN);
        adminUser.setId(1L);

        adminEmployee = new Employee("DF-001", "Admin", "User", "admin@dayflow.local", adminUser);
        adminEmployee.setId(1L);
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void getAttendance_ReturnsOk() throws Exception {
        when(appUserRepository.findByUsername("admin")).thenReturn(Optional.of(adminUser));
        when(employeeRepository.findByUserUsername("admin")).thenReturn(Optional.of(adminEmployee));
        when(attendanceRepository.findAllByOrderByCheckInDesc()).thenReturn(List.of());

        mockMvc.perform(get("/api/attendance"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void getLeaves_ReturnsOk() throws Exception {
        when(appUserRepository.findByUsername("admin")).thenReturn(Optional.of(adminUser));
        when(employeeRepository.findByUserUsername("admin")).thenReturn(Optional.of(adminEmployee));
        when(leaveRequestRepository.findAllByOrderByAppliedAtDesc()).thenReturn(List.of());

        mockMvc.perform(get("/api/leaves"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void getPayroll_ReturnsOk() throws Exception {
        when(appUserRepository.findByUsername("admin")).thenReturn(Optional.of(adminUser));
        when(employeeRepository.findByUserUsername("admin")).thenReturn(Optional.of(adminEmployee));
        when(payrollRepository.findAllByOrderByPayrollMonthDesc()).thenReturn(List.of());

        mockMvc.perform(get("/api/payroll"))
                .andExpect(status().isOk());
    }
}
