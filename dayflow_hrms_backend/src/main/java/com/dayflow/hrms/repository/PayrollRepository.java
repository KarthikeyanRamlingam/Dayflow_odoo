package com.dayflow.hrms.repository;

import com.dayflow.hrms.entity.Payroll;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PayrollRepository extends JpaRepository<Payroll, Long> {
    List<Payroll> findByEmployeeIdOrderByPayrollMonthDesc(Long employeeId);
    List<Payroll> findAllByOrderByPayrollMonthDesc();
    Optional<Payroll> findByEmployeeIdAndPayrollMonth(Long employeeId, String payrollMonth);
}
