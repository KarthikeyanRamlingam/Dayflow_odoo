package com.dayflow.hrms.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record DashboardStatsDto(
        long totalEmployees,
        long presentToday,
        long onLeaveToday,
        long pendingLeaves,
        BigDecimal monthlyPayrollExpenses,
        List<Map<String, Object>> attendanceTrends,
        List<Map<String, Object>> departmentDistribution,
        List<Map<String, Object>> leaveTypeDistribution,
        List<AttendanceDto> recentAttendance,
        List<LeaveDto> recentLeaves
) {}
