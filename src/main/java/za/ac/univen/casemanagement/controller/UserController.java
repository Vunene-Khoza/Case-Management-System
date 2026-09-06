package za.ac.univen.casemanagement.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import za.ac.univen.casemanagement.dto.request.CreateAdminRequest;
import za.ac.univen.casemanagement.dto.request.CreateLegalOfficerRequest;
import za.ac.univen.casemanagement.dto.request.UserRequest;
import za.ac.univen.casemanagement.dto.response.ApiResponse;
import za.ac.univen.casemanagement.dto.response.UserResponse;
import za.ac.univen.casemanagement.service.UserService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers(Authentication authentication) {
        List<UserResponse> users = userService.getUsers(getUsername(authentication), isSuperAdmin(authentication));
        return ResponseEntity.ok(ApiResponse.success(200, "Users retrieved successfully", users));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UserResponse>> createUser(@Valid @RequestBody UserRequest request) {
        UserResponse created = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(201, "User created successfully", created));
    }

    @PostMapping("/admin")
    public ResponseEntity<ApiResponse<UserResponse>> createAdminUser(
            @Valid @RequestBody CreateAdminRequest request,
            Authentication authentication
    ) {
        UserResponse created = userService.createAdminUser(request, getUsername(authentication));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(201, "Administrator account created successfully", created));
    }

    @PostMapping("/legal-officer")
    public ResponseEntity<ApiResponse<UserResponse>> createLegalOfficerUser(
            @Valid @RequestBody CreateLegalOfficerRequest request,
            Authentication authentication
    ) {
        UserResponse created = userService.createLegalOfficerUser(request, getUsername(authentication));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(201, "Legal Officer account created successfully", created));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(
            @PathVariable Long userId,
            Authentication authentication
    ) {
        UserResponse user = userService.getUserById(userId, getUsername(authentication), isSuperAdmin(authentication));
        return ResponseEntity.ok(ApiResponse.success(200, "User details retrieved successfully", user));
    }

    @PutMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable Long userId,
            @RequestBody UserRequest request,
            Authentication authentication
    ) {
        UserResponse updated = userService.updateUser(userId, request, getUsername(authentication), isSuperAdmin(authentication));
        return ResponseEntity.ok(ApiResponse.success(200, "User updated successfully", updated));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @PathVariable Long userId,
            Authentication authentication
    ) {
        userService.deleteUser(userId, getUsername(authentication), isSuperAdmin(authentication));
        return ResponseEntity.ok(ApiResponse.success(200, "User deleted successfully", null));
    }

    private boolean isSuperAdmin(Authentication authentication) {
        if (authentication == null) return false;
        return authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_SUPER_ADMIN"));
    }

    private String getUsername(Authentication authentication) {
        return authentication != null ? authentication.getName() : null;
    }
}
