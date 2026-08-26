package com.dayflow.hrms.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PayrollDto(
        Long id,
        Long employeeId,
        String employeeName,
        String employeeCode,
        String department,
        BigDecimal basicSalary,
        BigDecimal allowances,
        BigDecimal deductions,
        BigDecimal netSalary,
        String payrollMonth,
        String paymentStatus,
        LocalDate paymentDate,
        String remarks
) {}
