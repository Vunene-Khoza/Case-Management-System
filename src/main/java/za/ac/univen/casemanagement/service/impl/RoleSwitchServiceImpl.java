package za.ac.univen.casemanagement.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import za.ac.univen.casemanagement.dto.response.RoleCountResponse;
import za.ac.univen.casemanagement.dto.response.UserResponse;
import za.ac.univen.casemanagement.entity.UserEntity;
import za.ac.univen.casemanagement.enums.UserRole;
import za.ac.univen.casemanagement.repository.UserRepository;
import za.ac.univen.casemanagement.service.RoleSwitchService;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class RoleSwitchServiceImpl implements RoleSwitchService {

    private final UserRepository userRepository;

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
}
