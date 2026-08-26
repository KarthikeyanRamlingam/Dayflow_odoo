package com.dayflow.hrms.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record PayrollInput(
        @NotNull Long employeeId,
        @NotNull BigDecimal basicSalary,
        BigDecimal allowances,
        BigDecimal deductions,
        @NotBlank String payrollMonth,
        String remarks
) {}
