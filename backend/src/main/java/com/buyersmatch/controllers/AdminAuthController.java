package com.buyersmatch.controllers;

import com.buyersmatch.dto.AdminLoginRequest;
import com.buyersmatch.dto.ChangePasswordRequest;
import com.buyersmatch.services.AdminAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/auth")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AdminAuthController {

    private final AdminAuthService adminAuthService;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@Valid @RequestBody AdminLoginRequest request) {
        return ResponseEntity.ok(Map.of("success", true, "data", adminAuthService.login(request)));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(
            @RequestHeader("X-Admin-Token") String sessionToken) {
        adminAuthService.logout(sessionToken);
        return ResponseEntity.ok(Map.of("success", true, "message", "Logged out successfully"));
    }

    @PatchMapping("/change-password")
    public ResponseEntity<Map<String, Object>> changePassword(
            @RequestHeader("X-Admin-Token") String sessionToken,
            @Valid @RequestBody ChangePasswordRequest request) {
        adminAuthService.changePassword(sessionToken, request.getCurrentPassword(), request.getNewPassword());
        return ResponseEntity.ok(Map.of("success", true, "message", "Password changed. Please log in again."));
    }

    @ExceptionHandler(org.springframework.web.server.ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> handleResponseStatus(
            org.springframework.web.server.ResponseStatusException ex) {
        return ResponseEntity.status(ex.getStatusCode())
                .body(Map.of("success", false, "error", ex.getReason()));
    }
}
