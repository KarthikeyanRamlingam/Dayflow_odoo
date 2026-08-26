package com.dayflow.hrms.config;

import com.dayflow.hrms.entity.*;
import com.dayflow.hrms.repository.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@Profile("!test")
public class BootstrapData {

    @Bean
    CommandLineRunner seedDemoData(
            AppUserRepository users,
            EmployeeRepository employees,
            AttendanceRepository attendances,
            LeaveRequestRepository leaves,
            PayrollRepository payrolls,
            PasswordEncoder encoder,
            @Value("${dayflow.bootstrap-admin.username:admin}") String adminUsername,
            @Value("${dayflow.bootstrap-admin.password:dayflow123}") String adminPassword) {

        return args -> {
            // 1. Admin account
            if (!users.existsByUsername(adminUsername)) {
                AppUser adminUser = users.save(new AppUser(
                        adminUsername,
                        adminUsername + "@dayflow.local",
                        encoder.encode(adminPassword),
                        Role.ADMIN
                ));
                if (adminUser != null) {
                    adminUser.setEmailVerified(true);
                    users.save(adminUser);

                    Employee adminEmp = new Employee("DF-001", "Alex", "Morgan", adminUser.getEmail(), adminUser);
                    adminEmp.setDepartment("Executive Leadership");
                    adminEmp.setJobTitle("Chief Human Resources Officer");
                    adminEmp.setPhone("+1 (555) 019-2831");
                    adminEmp.setAddress("742 Evergreen Terrace, Springfield, OR");
                    adminEmp.setEmergencyContact("+1 (555) 019-9999 (Spouse)");
                    adminEmp.setBaseSalary(BigDecimal.valueOf(140000));
                    adminEmp.setDateOfJoining(LocalDate.now().minusYears(3));
                    adminEmp.setDateOfBirth(LocalDate.of(1985, 4, 12));
                    employees.save(adminEmp);
                }
            }

            // 2. HR Manager account
            if (!users.existsByUsername("hrmanager")) {
                AppUser hrUser = users.save(new AppUser(
                        "hrmanager",
                        "sarah.connor@dayflow.local",
                        encoder.encode("dayflow123"),
                        Role.HR_MANAGER
                ));
                hrUser.setEmailVerified(true);
                users.save(hrUser);

                Employee hrEmp = new Employee("DF-002", "Sarah", "Connor", hrUser.getEmail(), hrUser);
                hrEmp.setDepartment("Human Resources");
                hrEmp.setJobTitle("Senior People Partner");
                hrEmp.setPhone("+1 (555) 234-5678");
                hrEmp.setAddress("100 Cyberdyne Way, Sunnyvale, CA");
                hrEmp.setEmergencyContact("+1 (555) 888-0000 (John Connor)");
                hrEmp.setBaseSalary(BigDecimal.valueOf(95000));
                hrEmp.setDateOfJoining(LocalDate.now().minusYears(2));
                hrEmp.setDateOfBirth(LocalDate.of(1990, 8, 25));
                employees.save(hrEmp);
            }

            // 3. Demo Employee 1 (Developer)
            if (!users.existsByUsername("john.doe")) {
                AppUser emp1User = users.save(new AppUser(
                        "john.doe",
                        "john.doe@dayflow.local",
                        encoder.encode("dayflow123"),
                        Role.EMPLOYEE
                ));
                emp1User.setEmailVerified(true);
                users.save(emp1User);

                Employee emp1 = new Employee("DF-101", "John", "Doe", emp1User.getEmail(), emp1User);
                emp1.setDepartment("Engineering");
                emp1.setJobTitle("Senior Full Stack Developer");
                emp1.setPhone("+1 (555) 345-6789");
                emp1.setAddress("456 Innovation Blvd, Austin, TX");
                emp1.setEmergencyContact("+1 (555) 777-1111 (Jane Doe)");
                emp1.setBaseSalary(BigDecimal.valueOf(115000));
                emp1.setDateOfJoining(LocalDate.now().minusMonths(14));
                emp1.setDateOfBirth(LocalDate.of(1993, 11, 15));
                Employee savedEmp1 = employees.save(emp1);

                // Seed Attendance for John Doe
                LocalDate today = LocalDate.now();
                for (int i = 6; i >= 1; i--) {
                    LocalDate d = today.minusDays(i);
                    Attendance a = new Attendance();
                    a.setEmployee(savedEmp1);
                    a.setAttendanceDate(d);
                    a.setCheckIn(d.atTime(9, 0));
                    a.setCheckOut(d.atTime(17, 30));
                    a.setDurationMinutes(510L);
                    a.setStatus("PRESENT");
                    attendances.save(a);
                }

                // Seed Today's active check-in
                Attendance todayAtt = new Attendance();
                todayAtt.setEmployee(savedEmp1);
                todayAtt.setAttendanceDate(today);
                todayAtt.setCheckIn(today.atTime(9, 15));
                todayAtt.setStatus("PRESENT");
                attendances.save(todayAtt);

                // Seed Leaves for John Doe
                LeaveRequest l1 = new LeaveRequest();
                l1.setEmployee(savedEmp1);
                l1.setStartDate(today.plusDays(10));
                l1.setEndDate(today.plusDays(14));
                l1.setType("Paid time off");
                l1.setReason("Annual family vacation trip to Hawaii.");
                l1.setStatus(LeaveStatus.PENDING);
                l1.setAppliedAt(LocalDateTime.now().minusDays(1));
                leaves.save(l1);

                LeaveRequest l2 = new LeaveRequest();
                l2.setEmployee(savedEmp1);
                l2.setStartDate(today.minusMonths(1));
                l2.setEndDate(today.minusMonths(1).plusDays(2));
                l2.setType("Sick leave");
                l2.setReason("Seasonal viral fever rest.");
                l2.setStatus(LeaveStatus.APPROVED);
                l2.setAppliedAt(LocalDateTime.now().minusMonths(1).minusDays(2));
                l2.setReviewedAt(LocalDateTime.now().minusMonths(1).minusDays(1));
                l2.setReviewedBy("admin");
                l2.setReviewComment("Approved. Get well soon!");
                leaves.save(l2);

                // Seed Payroll for John Doe
                Payroll p1 = new Payroll();
                p1.setEmployee(savedEmp1);
                p1.setBasicSalary(BigDecimal.valueOf(9583));
                p1.setAllowances(BigDecimal.valueOf(1200));
                p1.setDeductions(BigDecimal.valueOf(1800));
                p1.setNetSalary(BigDecimal.valueOf(8983));
                p1.setPayrollMonth("2026-07");
                p1.setPaymentStatus("PAID");
                p1.setPaymentDate(LocalDate.of(2026, 7, 31));
                p1.setRemarks("Monthly regular salary disbursement");
                payrolls.save(p1);

                Payroll p2 = new Payroll();
                p2.setEmployee(savedEmp1);
                p2.setBasicSalary(BigDecimal.valueOf(9583));
                p2.setAllowances(BigDecimal.valueOf(1200));
                p2.setDeductions(BigDecimal.valueOf(1800));
                p2.setNetSalary(BigDecimal.valueOf(8983));
                p2.setPayrollMonth("2026-08");
                p2.setPaymentStatus("PAID");
                p2.setPaymentDate(LocalDate.of(2026, 8, 31));
                p2.setRemarks("Monthly regular salary disbursement");
                payrolls.save(p2);
            }

            // 4. Demo Employee 2 (Product Designer)
            if (!users.existsByUsername("elena.rostova")) {
                AppUser emp2User = users.save(new AppUser(
                        "elena.rostova",
                        "elena.rostova@dayflow.local",
                        encoder.encode("dayflow123"),
                        Role.EMPLOYEE
                ));
                emp2User.setEmailVerified(true);
                users.save(emp2User);

                Employee emp2 = new Employee("DF-102", "Elena", "Rostova", emp2User.getEmail(), emp2User);
                emp2.setDepartment("Design");
                emp2.setJobTitle("Principal UI/UX Designer");
                emp2.setPhone("+1 (555) 456-7890");
                emp2.setAddress("789 Creative St, Seattle, WA");
                emp2.setBaseSalary(BigDecimal.valueOf(108000));
                emp2.setDateOfJoining(LocalDate.now().minusMonths(8));
                employees.save(emp2);

                Payroll p = new Payroll();
                p.setEmployee(emp2);
                p.setBasicSalary(BigDecimal.valueOf(9000));
                p.setAllowances(BigDecimal.valueOf(1000));
                p.setDeductions(BigDecimal.valueOf(1500));
                p.setNetSalary(BigDecimal.valueOf(8500));
                p.setPayrollMonth("2026-08");
                p.setPaymentStatus("PAID");
                p.setPaymentDate(LocalDate.of(2026, 8, 31));
                payrolls.save(p);
            }
        };
    }
}
