package com.dayflow.hrms.controller;

import com.dayflow.hrms.dto.AttendanceDto;
import com.dayflow.hrms.dto.DashboardStatsDto;
import com.dayflow.hrms.dto.LeaveDecisionInput;
import com.dayflow.hrms.dto.LeaveDto;
import com.dayflow.hrms.dto.LeaveRequestInput;
import com.dayflow.hrms.dto.PayrollDto;
import com.dayflow.hrms.dto.PayrollInput;
import com.dayflow.hrms.entity.AppUser;
import com.dayflow.hrms.entity.Attendance;
import com.dayflow.hrms.entity.Employee;
import com.dayflow.hrms.entity.LeaveRequest;
import com.dayflow.hrms.entity.LeaveStatus;
import com.dayflow.hrms.entity.Payroll;
import com.dayflow.hrms.entity.Role;
import com.dayflow.hrms.repository.AppUserRepository;
import com.dayflow.hrms.repository.AttendanceRepository;
import com.dayflow.hrms.repository.EmployeeRepository;
import com.dayflow.hrms.repository.LeaveRequestRepository;
import com.dayflow.hrms.repository.PayrollRepository;
import com.dayflow.hrms.service.EmailService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.security.Principal;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@Tag(name = "HR & Workday Operations", description = "Attendance, Leaves, Payroll, and Dashboards")
public class HrController {

    private final AppUserRepository users;
    private final EmployeeRepository employees;
    private final AttendanceRepository attendance;
    private final LeaveRequestRepository leaves;
    private final PayrollRepository payrolls;
    private final EmailService emailService;

    public HrController(AppUserRepository users,
                        EmployeeRepository employees,
                        AttendanceRepository attendance,
                        LeaveRequestRepository leaves,
                        PayrollRepository payrolls,
                        EmailService emailService) {
        this.users = users;
        this.employees = employees;
        this.attendance = attendance;
        this.leaves = leaves;
        this.payrolls = payrolls;
        this.emailService = emailService;
    }

    private AppUser getCurrentUser(Principal principal) {
        if (principal == null) {
            throw new IllegalStateException("Unauthenticated request");
        }
        String username = principal.getName();
        return users.findByUsername(username)
                .orElseGet(() -> users.findByEmail(username)
                        .orElseThrow(() -> new IllegalStateException("User not found: " + username)));
    }

    private Employee getEmployee(Principal principal) {
        AppUser user = getCurrentUser(principal);
        return employees.findByUserUsername(user.getUsername())
                .orElseThrow(() -> new IllegalStateException("Employee profile missing for user: " + user.getUsername()));
    }

    private boolean isManager(Principal principal) {
        AppUser u = getCurrentUser(principal);
        return u.getRole() == Role.ADMIN || u.getRole() == Role.HR_MANAGER;
    }

    private AttendanceDto toAttendanceDto(Attendance a) {
        Employee e = a.getEmployee();
        return new AttendanceDto(
                a.getId(),
                e.getId(),
                (e.getFirstName() + " " + e.getLastName()).trim(),
                e.getEmployeeCode(),
                a.getAttendanceDate(),
                a.getCheckIn(),
                a.getCheckOut(),
                a.getDurationMinutes(),
                a.getStatus(),
                a.getNotes()
        );
    }

    private LeaveDto toLeaveDto(LeaveRequest l) {
        Employee e = l.getEmployee();
        return new LeaveDto(
                l.getId(),
                e.getId(),
                (e.getFirstName() + " " + e.getLastName()).trim(),
                e.getEmployeeCode(),
                l.getStartDate(),
                l.getEndDate(),
                l.getType(),
                l.getReason(),
                l.getStatus().name(),
                l.getAppliedAt(),
                l.getReviewedAt(),
                l.getReviewedBy(),
                l.getReviewComment()
        );
    }

    private PayrollDto toPayrollDto(Payroll p) {
        Employee e = p.getEmployee();
        return new PayrollDto(
                p.getId(),
                e.getId(),
                (e.getFirstName() + " " + e.getLastName()).trim(),
                e.getEmployeeCode(),
                e.getDepartment(),
                p.getBasicSalary(),
                p.getAllowances(),
                p.getDeductions(),
                p.getNetSalary(),
                p.getPayrollMonth(),
                p.getPaymentStatus(),
                p.getPaymentDate(),
                p.getRemarks()
        );
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get rich metrics and analytics for dashboard")
    public ResponseEntity<DashboardStatsDto> getDashboardStats(Principal principal) {
        Employee currentEmp = getEmployee(principal);
        boolean manager = isManager(principal);
        LocalDate today = LocalDate.now();

        long totalEmployees = manager ? employees.count() : 1;
        long presentToday;
        long onLeaveToday;
        long pendingLeaves;
        BigDecimal monthlyExpenses = BigDecimal.ZERO;

        List<Attendance> allTodayAttendance = attendance.findByAttendanceDate(today);
        if (manager) {
            presentToday = allTodayAttendance.stream()
                    .filter(a -> a.getCheckIn() != null)
                    .map(a -> a.getEmployee().getId())
                    .distinct()
                    .count();

            onLeaveToday = leaves.findAll().stream()
                    .filter(l -> l.getStatus() == LeaveStatus.APPROVED
                            && !today.isBefore(l.getStartDate())
                            && !today.isAfter(l.getEndDate()))
                    .count();

            pendingLeaves = leaves.findAll().stream()
                    .filter(l -> l.getStatus() == LeaveStatus.PENDING)
                    .count();

            monthlyExpenses = payrolls.findAll().stream()
                    .map(Payroll::getNetSalary)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        } else {
            presentToday = allTodayAttendance.stream()
                    .filter(a -> a.getEmployee().getId().equals(currentEmp.getId()) && a.getCheckIn() != null)
                    .count();

            onLeaveToday = leaves.findByEmployeeIdOrderByStartDateDesc(currentEmp.getId()).stream()
                    .filter(l -> l.getStatus() == LeaveStatus.APPROVED
                            && !today.isBefore(l.getStartDate())
                            && !today.isAfter(l.getEndDate()))
                    .count();

            pendingLeaves = leaves.findByEmployeeIdOrderByStartDateDesc(currentEmp.getId()).stream()
                    .filter(l -> l.getStatus() == LeaveStatus.PENDING)
                    .count();

            monthlyExpenses = payrolls.findByEmployeeIdOrderByPayrollMonthDesc(currentEmp.getId()).stream()
                    .map(Payroll::getNetSalary)
                    .findFirst()
                    .orElse(BigDecimal.ZERO);
        }

        // 7-day attendance trends for Recharts
        List<Map<String, Object>> attendanceTrends = new ArrayList<>();
        DateTimeFormatter dayFormatter = DateTimeFormatter.ofPattern("EEE (MM/dd)");
        for (int i = 6; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            long presentCount = attendance.findByAttendanceDate(d).stream()
                    .filter(a -> manager || a.getEmployee().getId().equals(currentEmp.getId()))
                    .count();
            Map<String, Object> point = new HashMap<>();
            point.put("date", d.format(dayFormatter));
            point.put("present", presentCount);
            point.put("target", manager ? totalEmployees : 1);
            attendanceTrends.add(point);
        }

        // Department distribution
        Map<String, Long> deptCounts = employees.findAll().stream()
                .collect(Collectors.groupingBy(Employee::getDepartment, Collectors.counting()));
        List<Map<String, Object>> departmentDistribution = deptCounts.entrySet().stream()
                .map(e -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("name", e.getKey());
                    m.put("value", e.getValue());
                    return m;
                }).collect(Collectors.toList());

        // Leave type distribution
        Map<String, Long> leaveCounts = leaves.findAll().stream()
                .collect(Collectors.groupingBy(LeaveRequest::getType, Collectors.counting()));
        List<Map<String, Object>> leaveTypeDistribution = leaveCounts.entrySet().stream()
                .map(e -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("name", e.getKey());
                    m.put("value", e.getValue());
                    return m;
                }).collect(Collectors.toList());

        List<AttendanceDto> recentAttendance = (manager ? attendance.findAllByOrderByCheckInDesc() : attendance.findByEmployeeIdOrderByCheckInDesc(currentEmp.getId()))
                .stream().limit(5).map(this::toAttendanceDto).toList();

        List<LeaveDto> recentLeaves = (manager ? leaves.findAllByOrderByAppliedAtDesc() : leaves.findByEmployeeIdOrderByAppliedAtDesc(currentEmp.getId()))
                .stream().limit(5).map(this::toLeaveDto).toList();

        DashboardStatsDto stats = new DashboardStatsDto(
                totalEmployees,
                presentToday,
                onLeaveToday,
                pendingLeaves,
                monthlyExpenses,
                attendanceTrends,
                departmentDistribution,
                leaveTypeDistribution,
                recentAttendance,
                recentLeaves
        );
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/attendance")
    @Operation(summary = "Get attendance records")
    public List<AttendanceDto> getAttendance(Principal principal) {
        if (isManager(principal)) {
            return attendance.findAllByOrderByCheckInDesc().stream().map(this::toAttendanceDto).toList();
        }
        return attendance.findByEmployeeIdOrderByCheckInDesc(getEmployee(principal).getId()).stream().map(this::toAttendanceDto).toList();
    }

    @PostMapping("/attendance/check-in")
    @Operation(summary = "Check in current employee")
    public ResponseEntity<AttendanceDto> checkIn(Principal principal) {
        Employee emp = getEmployee(principal);
        LocalDate today = LocalDate.now();

        boolean alreadyCheckedIn = attendance.findByEmployeeIdOrderByCheckInDesc(emp.getId()).stream()
                .anyMatch(a -> a.getCheckOut() == null);
        if (alreadyCheckedIn) {
            return ResponseEntity.badRequest().build();
        }

        Attendance newRecord = new Attendance();
        newRecord.setEmployee(emp);
        newRecord.setAttendanceDate(today);
        newRecord.setCheckIn(LocalDateTime.now());
        newRecord.setStatus("PRESENT");

        Attendance saved = attendance.save(newRecord);
        return ResponseEntity.ok(toAttendanceDto(saved));
    }

    @PostMapping("/attendance/check-out")
    @Operation(summary = "Check out current employee")
    public ResponseEntity<AttendanceDto> checkOut(Principal principal) {
        Employee emp = getEmployee(principal);
        Attendance activeRecord = attendance.findByEmployeeIdOrderByCheckInDesc(emp.getId()).stream()
                .filter(a -> a.getCheckOut() == null)
                .findFirst()
                .orElse(null);

        if (activeRecord == null) {
            return ResponseEntity.badRequest().build();
        }

        LocalDateTime now = LocalDateTime.now();
        activeRecord.setCheckOut(now);
        long minutes = Duration.between(activeRecord.getCheckIn(), now).toMinutes();
        activeRecord.setDurationMinutes(minutes);

        if (minutes < 240) {
            activeRecord.setStatus("HALF_DAY");
        } else {
            activeRecord.setStatus("PRESENT");
        }

        Attendance saved = attendance.save(activeRecord);
        return ResponseEntity.ok(toAttendanceDto(saved));
    }

    @GetMapping("/leaves")
    @Operation(summary = "Get leave requests")
    public List<LeaveDto> getLeaves(Principal principal) {
        if (isManager(principal)) {
            return leaves.findAllByOrderByAppliedAtDesc().stream().map(this::toLeaveDto).toList();
        }
        return leaves.findByEmployeeIdOrderByAppliedAtDesc(getEmployee(principal).getId()).stream().map(this::toLeaveDto).toList();
    }

    @PostMapping("/leaves")
    @Operation(summary = "Apply for leave (Employee)")
    public ResponseEntity<LeaveDto> applyLeave(Principal principal, @Valid @RequestBody LeaveRequestInput input) {
        if (input.endDate().isBefore(input.startDate())) {
            return ResponseEntity.badRequest().build();
        }

        Employee emp = getEmployee(principal);
        LeaveRequest leave = new LeaveRequest();
        leave.setEmployee(emp);
        leave.setStartDate(input.startDate());
        leave.setEndDate(input.endDate());
        leave.setType(input.type());
        leave.setReason(input.reason());
        leave.setStatus(LeaveStatus.PENDING);
        leave.setAppliedAt(LocalDateTime.now());

        LeaveRequest saved = leaves.save(leave);
        return ResponseEntity.ok(toLeaveDto(saved));
    }

    @PatchMapping("/leaves/{id}/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Approve or Reject leave request with review remarks (HR/Admin)")
    public ResponseEntity<LeaveDto> decideLeave(@PathVariable Long id,
                                                @PathVariable LeaveStatus status,
                                                @RequestBody(required = false) LeaveDecisionInput decision,
                                                Principal principal) {
        if (status == LeaveStatus.PENDING) {
            return ResponseEntity.badRequest().build();
        }

        return leaves.findById(id).map(l -> {
            l.setStatus(status);
            l.setReviewedAt(LocalDateTime.now());
            l.setReviewedBy(principal != null ? principal.getName() : "System");
            if (decision != null && decision.reviewComment() != null) {
                l.setReviewComment(decision.reviewComment());
            }

            LeaveRequest saved = leaves.save(l);

            String comment = decision != null ? decision.reviewComment() : "";
            emailService.sendLeaveStatusNotification(
                    l.getEmployee().getEmail(),
                    l.getEmployee().getFirstName() + " " + l.getEmployee().getLastName(),
                    status.name(),
                    comment
            );

            return ResponseEntity.ok(toLeaveDto(saved));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/payroll")
    @Operation(summary = "Get payroll records")
    public List<PayrollDto> getPayroll(Principal principal) {
        if (isManager(principal)) {
            return payrolls.findAllByOrderByPayrollMonthDesc().stream().map(this::toPayrollDto).toList();
        }
        return payrolls.findByEmployeeIdOrderByPayrollMonthDesc(getEmployee(principal).getId()).stream().map(this::toPayrollDto).toList();
    }

    @PostMapping("/payroll")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Create or update employee payroll record (HR/Admin)")
    public ResponseEntity<PayrollDto> createPayroll(@Valid @RequestBody PayrollInput input) {
        return employees.findById(input.employeeId()).map(emp -> {
            Payroll p = payrolls.findByEmployeeIdAndPayrollMonth(emp.getId(), input.payrollMonth())
                    .orElse(new Payroll());

            p.setEmployee(emp);
            p.setBasicSalary(input.basicSalary());
            p.setAllowances(input.allowances() != null ? input.allowances() : BigDecimal.ZERO);
            p.setDeductions(input.deductions() != null ? input.deductions() : BigDecimal.ZERO);

            BigDecimal net = p.getBasicSalary().add(p.getAllowances()).subtract(p.getDeductions());
            p.setNetSalary(net.max(BigDecimal.ZERO));
            p.setPayrollMonth(input.payrollMonth());
            p.setPaymentStatus("PAID");
            p.setPaymentDate(LocalDate.now());
            p.setRemarks(input.remarks());

            Payroll saved = payrolls.save(p);
            return ResponseEntity.ok(toPayrollDto(saved));
        }).orElse(ResponseEntity.notFound().build());
    }
}
