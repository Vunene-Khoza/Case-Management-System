package za.ac.univen.casemanagement.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import za.ac.univen.casemanagement.dto.request.CreateActivityLogRequest;
import za.ac.univen.casemanagement.dto.request.RoleSwitchLogRequest;
import za.ac.univen.casemanagement.dto.response.ApiResponse;
import za.ac.univen.casemanagement.dto.response.ActivityLogResponse;
import za.ac.univen.casemanagement.enums.ActivityCategory;
import za.ac.univen.casemanagement.service.ActivityLogService;

@RestController
@RequestMapping("/api/v1/activity-logs")
@RequiredArgsConstructor
public class ActivityLogController {

    private final ActivityLogService activityLogService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ActivityLogResponse>>> getLogs(
            @RequestParam(required = false) ActivityCategory category,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "timestamp") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestHeader(value = "X-Preview-Role", required = false) String previewRole,
            @RequestHeader(value = "X-Preview-Email", required = false) String previewEmail,
            Authentication authentication
    ) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<ActivityLogResponse> logs = activityLogService.getLogs(category, status, search, pageable, authentication, previewRole, previewEmail);
        return ResponseEntity.ok(ApiResponse.success(200, "Activity logs retrieved successfully", logs));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ActivityLogResponse>> recordActivity(
            @Valid @RequestBody CreateActivityLogRequest request,
            Authentication authentication,
            HttpServletRequest httpServletRequest
    ) {
        String ipAddress = extractClientIp(httpServletRequest);
        ActivityLogResponse response = activityLogService.recordCustomEvent(request, authentication, ipAddress);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(201, "Activity logged successfully", response));
    }

    @PostMapping("/role-switch")
    public ResponseEntity<ApiResponse<ActivityLogResponse>> recordRoleSwitch(
            @Valid @RequestBody RoleSwitchLogRequest request,
            Authentication authentication,
            HttpServletRequest httpServletRequest
    ) {
        String ipAddress = extractClientIp(httpServletRequest);
        ActivityLogResponse response = activityLogService.recordRoleSwitch(request, authentication, ipAddress);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(201, "Role switch activity logged successfully", response));
    }

    private String extractClientIp(HttpServletRequest request) {
        if (request == null) return "127.0.0.1";
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isBlank() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isBlank() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip != null ? ip : "127.0.0.1";
    }
}
