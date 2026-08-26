package com.dayflow.hrms.controller;

import com.dayflow.hrms.dto.EmployeeDto;
import com.dayflow.hrms.service.EmployeeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.security.Principal;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/me")
@Tag(name = "Profile", description = "Current authenticated user profile management")
public class ProfileController {

    private final EmployeeService employeeService;

    public ProfileController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @GetMapping
    @Operation(summary = "Get current authenticated employee profile")
    public ResponseEntity<EmployeeDto> currentUser(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        EmployeeDto dto = employeeService.getByUsername(principal.getName());
        if (dto == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(dto);
    }

    @PutMapping
    @Operation(summary = "Update current authenticated employee personal details")
    public ResponseEntity<EmployeeDto> updateSelfProfile(Principal principal, @RequestBody EmployeeDto dto) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        EmployeeDto updated = employeeService.updateSelfProfile(principal.getName(), dto);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }
}
