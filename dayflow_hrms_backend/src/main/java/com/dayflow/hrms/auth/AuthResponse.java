package com.dayflow.hrms.auth;

public class AuthResponse {
    private String token;
    private String username;
    private String email;
    private String role;
    private Long employeeId;
    private String fullName;

    public AuthResponse() {
    }

    public AuthResponse(String token, String username, String email, String role, Long employeeId, String fullName) {
        this.token = token;
        this.username = username;
        this.email = email;
        this.role = role;
        this.employeeId = employeeId;
        this.fullName = fullName;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }
}
