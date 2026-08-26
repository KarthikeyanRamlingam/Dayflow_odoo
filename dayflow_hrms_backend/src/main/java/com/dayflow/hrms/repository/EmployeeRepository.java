package com.dayflow.hrms.repository;

import com.dayflow.hrms.entity.Employee;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findByUserUsername(String username);
    Optional<Employee> findByEmail(String email);
    Optional<Employee> findByEmployeeCode(String employeeCode);
    List<Employee> findByDepartment(String department);
    List<Employee> findByStatus(String status);

    @Query("SELECT e FROM Employee e WHERE " +
           "LOWER(e.firstName) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(e.lastName) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(e.email) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(e.employeeCode) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(e.department) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(e.jobTitle) LIKE LOWER(CONCAT('%', :q, '%'))")
    List<Employee> search(@Param("q") String q);
}
