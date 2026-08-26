package com.dayflow.hrms.repository;

import com.dayflow.hrms.entity.Attendance;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByEmployeeIdOrderByCheckInDesc(Long employeeId);
    List<Attendance> findAllByOrderByCheckInDesc();
    List<Attendance> findByAttendanceDate(LocalDate attendanceDate);
    Optional<Attendance> findByEmployeeIdAndAttendanceDate(Long employeeId, LocalDate attendanceDate);
}
