package com.dayflow.hrms.repository;

import com.dayflow.hrms.entity.Payroll;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PayrollRepository extends JpaRepository<Payroll, Long> {
}
