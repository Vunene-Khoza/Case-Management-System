package za.ac.univen.casemanagement.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import za.ac.univen.casemanagement.dto.request.CreateActivityLogRequest;
import za.ac.univen.casemanagement.dto.request.RoleSwitchLogRequest;
import za.ac.univen.casemanagement.dto.response.ActivityLogResponse;
import za.ac.univen.casemanagement.entity.ActivityLogEntity;
import za.ac.univen.casemanagement.entity.UserEntity;
import za.ac.univen.casemanagement.enums.ActivityCategory;
import za.ac.univen.casemanagement.enums.UserRole;
import za.ac.univen.casemanagement.repository.ActivityLogRepository;
import za.ac.univen.casemanagement.repository.UserRepository;
import za.ac.univen.casemanagement.service.ActivityLogService;

import java.time.Instant;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ActivityLogServiceImpl implements ActivityLogService {

    private final ActivityLogRepository activityLogRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String userEmail,
                    ActivityCategory category,
                    String action,
                    String entityType,
                    String entityId,
                    String description,
                    String status,
                    String ipAddress,
                    String detailsJson) {
        try {
            String userId = null;
            String userName = userEmail != null ? userEmail : "System";
            String userRole = "SYSTEM";
            String actorAdminOwner = "SYSTEM";

            if (userEmail != null && !userEmail.isBlank()) {
                Optional<UserEntity> userOpt = userRepository.findByEmailIgnoreCase(userEmail);
                if (userOpt.isPresent()) {
                    UserEntity user = userOpt.get();
                    userId = user.getUserId() != null ? "U" + String.format("%03d", user.getUserId()) : null;
                    userName = (user.getName() != null ? user.getName() : "") +
                            (user.getSurname() != null ? " " + user.getSurname() : "");
                    userName = userName.trim().isEmpty() ? user.getEmail() : userName.trim();
                    userRole = user.getRole() != null ? user.getRole().name() : "USER";

                    if (user.getRole() == UserRole.SUPER_ADMIN) {
                        actorAdminOwner = "SYSTEM";
                    } else if (user.getRole() == UserRole.ADMIN) {
                        actorAdminOwner = user.getEmail();
                    } else if (user.getRole() == UserRole.LEGAL_OFFICER || user.getRole() == UserRole.VIEWER) {
                        actorAdminOwner = user.getCreatedBy() != null && !user.getCreatedBy().isBlank()
                                ? user.getCreatedBy()
                                : "SYSTEM";
                    }
                }
            }

            ActivityLogEntity entity = ActivityLogEntity.builder()
                    .timestamp(Instant.now())
                    .userId(userId)
                    .userEmail(userEmail != null ? userEmail : "system@univen.ac.za")
                    .userName(userName)
                    .userRole(userRole)
                    .category(category)
                    .action(action)
                    .entityType(entityType)
                    .entityId(entityId)
                    .description(description)
                    .ipAddress(ipAddress != null ? ipAddress : "127.0.0.1")
                    .status(status != null ? status : "SUCCESS")
                    .detailsJson(detailsJson)
                    .actorAdminOwner(actorAdminOwner)
                    .build();

            activityLogRepository.save(entity);
        } catch (Exception e) {
            log.error("Failed to record activity log for action {}: {}", action, e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ActivityLogResponse> getLogs(ActivityCategory category,
                                             String status,
                                             String search,
                                             Pageable pageable,
                                             Authentication authentication,
                                             String previewRole,
                                             String previewEmail) {
        String currentUsername = authentication != null ? authentication.getName() : "";
        boolean isSuperAdmin = false;
        boolean isAdmin = false;
        boolean isOfficer = false;

        if (authentication != null) {
            isSuperAdmin = authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_SUPER_ADMIN"));
            isAdmin = authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            isOfficer = authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_LEGAL_OFFICER"));
        }

        // If Super Admin is previewing an Admin or Legal Officer account, apply the preview scope
        if (isSuperAdmin && previewRole != null && !previewRole.isBlank()) {
            String roleUpper = previewRole.trim().toUpperCase();
            String effectiveEmail = (previewEmail != null && !previewEmail.isBlank())
                    ? previewEmail.trim().toLowerCase()
                    : currentUsername;

            if ("ADMIN".equals(roleUpper) || "ROLE_ADMIN".equals(roleUpper)) {
                isSuperAdmin = false;
                isAdmin = true;
                currentUsername = effectiveEmail;
            } else if ("LEGAL_OFFICER".equals(roleUpper) || "ROLE_LEGAL_OFFICER".equals(roleUpper)) {
                isSuperAdmin = false;
                isAdmin = false;
                isOfficer = true;
                currentUsername = effectiveEmail;
            }
        }

        Page<ActivityLogEntity> entities = activityLogRepository.findScopedLogs(
                isSuperAdmin,
                isAdmin,
                currentUsername,
                isOfficer,
                currentUsername,
                category,
                status,
                search != null && !search.isBlank() ? search.trim() : null,
                pageable
        );

        return entities.map(this::mapToResponse);
    }

    @Override
    @Transactional
    public ActivityLogResponse recordCustomEvent(CreateActivityLogRequest request,
                                                 Authentication authentication,
                                                 String ipAddress) {
        String userEmail = authentication != null ? authentication.getName() : "system@univen.ac.za";
        log(userEmail,
                request.getCategory(),
                request.getAction(),
                request.getEntityType(),
                request.getEntityId(),
                request.getDescription(),
                request.getStatus() != null ? request.getStatus() : "SUCCESS",
                ipAddress,
                request.getDetailsJson());

        // Return latest logged entry
        return ActivityLogResponse.builder()
                .action(request.getAction())
                .category(request.getCategory())
                .entityType(request.getEntityType())
                .entityId(request.getEntityId())
                .description(request.getDescription())
                .userEmail(userEmail)
                .status(request.getStatus() != null ? request.getStatus() : "SUCCESS")
                .timestamp(Instant.now())
                .build();
    }

    @Override
    @Transactional
    public ActivityLogResponse recordRoleSwitch(RoleSwitchLogRequest request,
                                                Authentication authentication,
                                                String ipAddress) {
        String userEmail = authentication != null ? authentication.getName() : "superadmin@univen.ac.za";
        String description = "Super Admin previewed workspace as " + request.getTargetUserName() + " (" + request.getTargetRole() + ")";
        if (request.getActionsTaken() != null && !request.getActionsTaken().isBlank()) {
            description = request.getActionsTaken();
        }

        String targetUserIdStr = request.getTargetUserId() != null ? String.valueOf(request.getTargetUserId()) : null;

        log(userEmail,
                ActivityCategory.SECURITY,
                "ROLE_SWITCHED",
                "RoleView",
                targetUserIdStr,
                description,
                "SUCCESS",
                ipAddress,
                "{\"targetRole\":\"" + request.getTargetRole() + "\",\"targetEmail\":\"" + request.getTargetUserEmail() + "\"}");

        return ActivityLogResponse.builder()
                .action("ROLE_SWITCHED")
                .category(ActivityCategory.SECURITY)
                .entityType("RoleView")
                .entityId(targetUserIdStr)
                .description(description)
                .userEmail(userEmail)
                .status("SUCCESS")
                .timestamp(Instant.now())
                .build();
    }

    private ActivityLogResponse mapToResponse(ActivityLogEntity entity) {
        return ActivityLogResponse.builder()
                .id(entity.getId() != null ? "LOG-" + entity.getId() : "")
                .timestamp(entity.getTimestamp())
                .userId(entity.getUserId())
                .userName(entity.getUserName())
                .userEmail(entity.getUserEmail())
                .userRole(entity.getUserRole())
                .userAvatar(entity.getUserAvatar())
                .category(entity.getCategory())
                .action(entity.getAction())
                .entityType(entity.getEntityType())
                .entityId(entity.getEntityId())
                .description(entity.getDescription())
                .ipAddress(entity.getIpAddress())
                .status(entity.getStatus())
                .detailsJson(entity.getDetailsJson())
                .actorAdminOwner(entity.getActorAdminOwner())
                .build();
    }
}
