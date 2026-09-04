package za.ac.univen.casemanagement.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import za.ac.univen.casemanagement.dto.request.ChangeFirstTimePasswordRequest;
import za.ac.univen.casemanagement.dto.request.LoginRequest;
import za.ac.univen.casemanagement.dto.response.ApiResponse;
import za.ac.univen.casemanagement.dto.response.AuthResponse;
import za.ac.univen.casemanagement.service.AuthService;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success(200, "Authentication successful", response));
    }

    @PostMapping("/change-first-time-password")
    public ResponseEntity<ApiResponse<Void>> changeFirstTimePassword(@Valid @RequestBody ChangeFirstTimePasswordRequest request) {
        authService.changeFirstTimePassword(request);
        return ResponseEntity.ok(ApiResponse.success(200, "Password updated successfully! Please sign in with your new password.", null));
    }
}
