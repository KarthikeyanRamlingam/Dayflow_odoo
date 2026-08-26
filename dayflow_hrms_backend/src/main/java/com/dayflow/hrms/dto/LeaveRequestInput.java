package com.dayflow.hrms.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
public record LeaveRequestInput(@NotNull LocalDate startDate, @NotNull LocalDate endDate, @NotBlank String type, @NotBlank String reason) {}
