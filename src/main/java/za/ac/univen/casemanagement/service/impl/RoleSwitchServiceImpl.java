package za.ac.univen.casemanagement.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import za.ac.univen.casemanagement.dto.request.RoleSwitchLogRequest;
import za.ac.univen.casemanagement.dto.response.RoleCountResponse;
import za.ac.univen.casemanagement.dto.response.RoleSwitchLogResponse;
import za.ac.univen.casemanagement.dto.response.UserResponse;
import za.ac.univen.casemanagement.entity.RoleSwitchLogEntity;
import za.ac.univen.casemanagement.entity.UserEntity;
import za.ac.univen.casemanagement.enums.UserRole;
import za.ac.univen.casemanagement.repository.RoleSwitchLogRepository;
import za.ac.univen.casemanagement.repository.UserRepository;
import za.ac.univen.casemanagement.service.RoleSwitchService;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class RoleSwitchServiceImpl implements RoleSwitchService {

    private final UserRepository userRepository;
    private final RoleSwitchLogRepository roleSwitchLogRepository;

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter
            .ofPattern("yyyy-MM-dd · HH:mm")
            .withZone(ZoneId.of("Africa/Johannesburg"));

    @Override
    @Transactional(readOnly = true)
    public RoleCountResponse getRoleCounts() {
        long adminCount = userRepository.countByRoleAndStatus(UserRole.ADMIN, "ACTIVE");
        long officerCount = userRepository.countByRoleAndStatus(UserRole.LEGAL_OFFICER, "ACTIVE");
        long viewerCount = userRepository.countByRoleAndStatus(UserRole.VIEWER, "ACTIVE");
        long superAdminCount = userRepository.countByRoleAndStatus(UserRole.SUPER_ADMIN, "ACTIVE");

        return RoleCountResponse.builder()
                .adminCount(adminCount)
                .legalOfficerCount(officerCount)
                .viewerCount(viewerCount)
                .superAdminCount(superAdminCount)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getUsersByRole(UserRole role) {
        List<UserEntity> users = userRepository.findByRoleAndStatus(role, "ACTIVE");
        if (users.isEmpty()) {
            users = userRepository.findByRole(role);
        }

        return users.stream()
                .map(this::mapToUserResponse)
                .toList();
    }

    @Override
    public RoleSwitchLogResponse logRoleSwitch(RoleSwitchLogRequest request, String superAdminEmail) {
        UserRole targetRole;
        try {
            targetRole = UserRole.valueOf(request.getTargetRole().trim().toUpperCase());
        } catch (Exception e) {
            targetRole = UserRole.ADMIN;
        }

        String callerEmail = (superAdminEmail != null && !superAdminEmail.isBlank())
                ? superAdminEmail
                : "superadmin@univen.ac.za";

        String actionDescription = request.getActionsTaken() != null && !request.getActionsTaken().isBlank()
                ? request.getActionsTaken()
                : "Super Admin switched into account for " + request.getTargetUserName();

        RoleSwitchLogEntity entity = RoleSwitchLogEntity.builder()
                .superAdminEmail(callerEmail)
                .targetUserId(request.getTargetUserId())
                .targetUserName(request.getTargetUserName())
                .targetUserEmail(request.getTargetUserEmail())
                .targetRole(targetRole)
                .duration("Just now")
                .actionsTaken(actionDescription)
                .build();

        RoleSwitchLogEntity saved = roleSwitchLogRepository.save(entity);
        log.info("Role switch recorded: Super Admin {} previewing account {}", callerEmail, request.getTargetUserEmail());
        return mapToSwitchLogResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoleSwitchLogResponse> getRoleSwitchHistory() {
        return roleSwitchLogRepository.findTop50ByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToSwitchLogResponse)
                .toList();
    }

    private UserResponse mapToUserResponse(UserEntity entity) {
        return UserResponse.builder()
                .userId(entity.getUserId())
                .name(entity.getName())
                .surname(entity.getSurname())
                .email(entity.getEmail())
                .employeeNumber(entity.getEmployeeNumber())
                .phoneNumber(entity.getPhoneNumber())
                .idNumber(entity.getIdNumber())
                .department(entity.getDepartment())
                .role(entity.getRole())
                .status(entity.getStatus())
                .mustChangePassword(entity.isMustChangePassword())
                .firstLoginCompleted(entity.isFirstLoginCompleted())
                .lastLogin(entity.getLastLogin())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    private RoleSwitchLogResponse mapToSwitchLogResponse(RoleSwitchLogEntity entity) {
        String roleLabel;
        String badgeClass;
        switch (entity.getTargetRole()) {
            case ADMIN -> {
                roleLabel = "Admin";
                badgeClass = "badge-admin";
            }
            case LEGAL_OFFICER -> {
                roleLabel = "Legal Officer";
                badgeClass = "badge-officer";
            }
            case VIEWER -> {
                roleLabel = "Viewer";
                badgeClass = "badge-viewer";
            }
            default -> {
                roleLabel = entity.getTargetRole().name();
                badgeClass = "badge-admin";
            }
        }

        String switchedTo = roleLabel + " View (" + entity.getTargetUserName() + ")";
        String formattedTimestamp = entity.getCreatedAt() != null
                ? FORMATTER.format(entity.getCreatedAt())
                : FORMATTER.format(Instant.now());

        return RoleSwitchLogResponse.builder()
                .logId(entity.getLogId())
                .timestamp(formattedTimestamp)
                .switchedTo(switchedTo)
                .badgeClass(badgeClass)
                .duration(entity.getDuration() != null ? entity.getDuration() : "10 min")
                .actionsTaken(entity.getActionsTaken())
                .targetUserName(entity.getTargetUserName())
                .targetUserEmail(entity.getTargetUserEmail())
                .targetRole(entity.getTargetRole().name())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
