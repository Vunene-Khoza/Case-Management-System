package za.ac.univen.casemanagement.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import za.ac.univen.casemanagement.dto.request.RoleSwitchLogRequest;
import za.ac.univen.casemanagement.dto.response.ApiResponse;
import za.ac.univen.casemanagement.dto.response.RoleCountResponse;
import za.ac.univen.casemanagement.dto.response.RoleSwitchLogResponse;
import za.ac.univen.casemanagement.dto.response.UserResponse;
import za.ac.univen.casemanagement.enums.UserRole;
import za.ac.univen.casemanagement.service.RoleSwitchService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/role-access")
@RequiredArgsConstructor
public class RoleSwitchController {

    private final RoleSwitchService roleSwitchService;

    @GetMapping("/counts")
    public ResponseEntity<ApiResponse<RoleCountResponse>> getRoleCounts() {
        RoleCountResponse counts = roleSwitchService.getRoleCounts();
        return ResponseEntity.ok(ApiResponse.success(200, "Role counts retrieved successfully", counts));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getUsersByRole(
            @RequestParam(required = false, defaultValue = "ADMIN") String role
    ) {
        UserRole userRole;
        try {
            userRole = UserRole.valueOf(role.trim().toUpperCase());
        } catch (Exception e) {
            userRole = UserRole.ADMIN;
        }

        List<UserResponse> users = roleSwitchService.getUsersByRole(userRole);
        return ResponseEntity.ok(ApiResponse.success(200, "Users for role " + userRole + " retrieved successfully", users));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<RoleSwitchLogResponse>>> getRoleSwitchHistory() {
        List<RoleSwitchLogResponse> history = roleSwitchService.getRoleSwitchHistory();
        return ResponseEntity.ok(ApiResponse.success(200, "Role switch history retrieved successfully", history));
    }

    @PostMapping("/switch")
    public ResponseEntity<ApiResponse<RoleSwitchLogResponse>> logRoleSwitch(
            @Valid @RequestBody RoleSwitchLogRequest request,
            Authentication authentication
    ) {
        String superAdminEmail = authentication != null ? authentication.getName() : "superadmin@univen.ac.za";
        RoleSwitchLogResponse logResponse = roleSwitchService.logRoleSwitch(request, superAdminEmail);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(201, "Role switch recorded successfully", logResponse));
    }
}
