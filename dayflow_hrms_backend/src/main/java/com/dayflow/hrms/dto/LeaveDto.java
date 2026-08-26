package com.dayflow.hrms.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record LeaveDto(
        Long id,
        Long employeeId,
        String employeeName,
        String employeeCode,
        LocalDate startDate,
        LocalDate endDate,
        String type,
        String reason,
        String status,
        LocalDateTime appliedAt,
        LocalDateTime reviewedAt,
        String reviewedBy,
        String reviewComment
) {}
