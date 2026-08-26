package com.dayflow.hrms.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record AttendanceDto(
        Long id,
        Long employeeId,
        String employeeName,
        String employeeCode,
        LocalDate attendanceDate,
        LocalDateTime checkIn,
        LocalDateTime checkOut,
        Long durationMinutes,
        String status,
        String notes
) {}
