package com.dayflow.hrms.controller;

import com.dayflow.hrms.entity.AppUser;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ProfileController {

    @GetMapping("/me")
    public ResponseEntity<AppUser> currentUser(@AuthenticationPrincipal AppUser user) {
        return ResponseEntity.ok(user);
    }
}
