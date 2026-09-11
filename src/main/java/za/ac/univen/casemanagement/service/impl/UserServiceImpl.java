package za.ac.univen.casemanagement.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import za.ac.univen.casemanagement.dto.request.CreateAdminRequest;
import za.ac.univen.casemanagement.dto.request.CreateLegalOfficerRequest;
import za.ac.univen.casemanagement.dto.request.UserRequest;
import za.ac.univen.casemanagement.dto.response.UserResponse;
import za.ac.univen.casemanagement.entity.UserEntity;
import za.ac.univen.casemanagement.enums.ActivityCategory;
import za.ac.univen.casemanagement.enums.UserRole;
import za.ac.univen.casemanagement.exception.BadRequestException;
import za.ac.univen.casemanagement.exception.ResourceNotFoundException;
import za.ac.univen.casemanagement.repository.EmployeeRepository;
import za.ac.univen.casemanagement.repository.UserRepository;
import za.ac.univen.casemanagement.service.ActivityLogService;
import za.ac.univen.casemanagement.service.UserService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final ActivityLogService activityLogService;
    private final za.ac.univen.casemanagement.security.OwnershipService ownershipService;

    @Override
    @Transactional
    public UserResponse createUser(UserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered: " + request.getEmail());
        }

        UserEntity entity = UserEntity.builder()
                .name(request.getName())
                .email(request.getEmail().trim().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .status(request.getStatus() != null ? request.getStatus() : "ACTIVE")
                .firstLoginCompleted(true)
                .mustChangePassword(false)
                .build();

        UserEntity saved = userRepository.save(entity);
        if (saved.getRole() == UserRole.ADMIN && saved.getAdminOwnerId() == null) {
            saved.setAdminOwnerId(saved.getUserId());
            saved = userRepository.save(saved);
        }
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public UserResponse createAdminUser(CreateAdminRequest request) {
        return createAdminUser(request, "SYSTEM");
    }

    @Override
    @Transactional
    public UserResponse createAdminUser(CreateAdminRequest request, String creatorUsername) {
        String email = request.getEmail().trim().toLowerCase();
        String empNum = request.getEmployeeNumber().trim();

        if (!email.endsWith("@univen.ac.za")) {
            throw new BadRequestException("Administrator email must be an official @univen.ac.za institutional address.");
        }

        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("An account with email " + email + " is already registered.");
        }

        if (userRepository.existsByEmployeeNumber(empNum)) {
            throw new BadRequestException("An account with Employee Number " + empNum + " is already registered.");
        }

        if (!employeeRepository.existsByEmployeeNumber(empNum)) {
            throw new ResourceNotFoundException("No official University of Venda employee found for Staff Number: " + empNum);
        }

        UserEntity adminEntity = UserEntity.builder()
                .name(request.getName().trim())
                .surname(request.getSurname().trim())
                .email(email)
                .employeeNumber(empNum)
                .phoneNumber(request.getPhoneNumber().trim())
                .idNumber(request.getIdNumber().trim())
                .department(request.getDepartment().trim())
                .password(passwordEncoder.encode(request.getTemporaryPassword()))
                .role(UserRole.ADMIN)
                .status("ACTIVE")
                .mustChangePassword(true)
                .firstLoginCompleted(false)
                .createdBy(creatorUsername != null ? creatorUsername.trim().toLowerCase() : "SYSTEM")
                .build();

        UserEntity saved = userRepository.save(adminEntity);
        // An Admin is the owner of their own administrative workspace
        saved.setAdminOwnerId(saved.getUserId());
        saved = userRepository.save(saved);

        activityLogService.log(
                creatorUsername != null ? creatorUsername : "SYSTEM",
                ActivityCategory.USER,
                "USER_CREATED",
                "User",
                "U" + saved.getUserId(),
                "Created new Administrator account for " + saved.getName() + " (" + saved.getEmail() + ")",
                "SUCCESS",
                null,
                "{\"role\":\"ADMIN\",\"employeeNumber\":\"" + saved.getEmployeeNumber() + "\"}"
        );

        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public UserResponse createLegalOfficerUser(CreateLegalOfficerRequest request) {
        return createLegalOfficerUser(request, "SYSTEM");
    }

    @Override
    @Transactional
    public UserResponse createLegalOfficerUser(CreateLegalOfficerRequest request, String creatorUsername) {
        String email = request.getEmail().trim().toLowerCase();
        String empNum = request.getEmployeeNumber().trim();

        if (!email.endsWith("@univen.ac.za")) {
            throw new BadRequestException("Legal Officer email must be an official @univen.ac.za institutional address.");
        }

        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("An account with email " + email + " is already registered.");
        }

        if (userRepository.existsByEmployeeNumber(empNum)) {
            throw new BadRequestException("An account with Employee Number " + empNum + " is already registered.");
        }

        if (!employeeRepository.existsByEmployeeNumber(empNum)) {
            throw new ResourceNotFoundException("No official University of Venda employee found for Staff Number: " + empNum);
        }

        Long adminOwnerId = null;
        if (creatorUsername != null && !creatorUsername.isBlank() && !"SYSTEM".equalsIgnoreCase(creatorUsername)) {
            UserEntity creator = userRepository.findByEmailIgnoreCase(creatorUsername.trim()).orElse(null);
            if (creator != null) {
                adminOwnerId = ownershipService.resolveAdminOwnerId(creator);
            }
        }

        UserEntity legalOfficerEntity = UserEntity.builder()
                .name(request.getName().trim())
                .surname(request.getSurname().trim())
                .email(email)
                .employeeNumber(empNum)
                .phoneNumber(request.getPhoneNumber().trim())
                .idNumber(request.getIdNumber().trim())
                .department(request.getDepartment().trim())
                .password(passwordEncoder.encode(request.getTemporaryPassword()))
                .role(UserRole.LEGAL_OFFICER)
                .status("ACTIVE")
                .mustChangePassword(true)
                .firstLoginCompleted(false)
                .createdBy(creatorUsername != null ? creatorUsername.trim().toLowerCase() : "SYSTEM")
                .adminOwnerId(adminOwnerId)
                .build();

        UserEntity saved = userRepository.save(legalOfficerEntity);

        activityLogService.log(
                creatorUsername != null ? creatorUsername : "SYSTEM",
                ActivityCategory.USER,
                "USER_CREATED",
                "User",
                "U" + saved.getUserId(),
                "Created new Legal Officer account for " + saved.getName() + " (" + saved.getEmail() + ")",
                "SUCCESS",
                null,
                "{\"role\":\"LEGAL_OFFICER\",\"employeeNumber\":\"" + saved.getEmployeeNumber() + "\"}"
        );

        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return getUsers(null, true);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getUsers(String currentUsername, boolean isSuperAdmin) {
        if (isSuperAdmin) {
            return userRepository.findAll()
                    .stream()
                    .map(this::mapToResponse)
                    .toList();
        }
        if (currentUsername == null || currentUsername.isBlank()) {
            return List.of();
        }
        UserEntity currentUser = userRepository.findByEmailIgnoreCase(currentUsername.trim()).orElse(null);
        if (currentUser == null) {
            return List.of();
        }
        Long currentAdminOwnerId = ownershipService.resolveAdminOwnerId(currentUser);
        if (currentAdminOwnerId == null) {
            return List.of();
        }
        // Normal Admin: sees only users belonging to their workspace (excluding other ADMIN accounts)
        return userRepository.findByAdminOwnerIdAndRoleNot(currentAdminOwnerId, UserRole.ADMIN)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long userId) {
        return getUserById(userId, null, true);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long userId, String currentUsername, boolean isSuperAdmin) {
        UserEntity entity = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        if (!isSuperAdmin) {
            UserEntity currentUser = (currentUsername != null && !currentUsername.isBlank())
                    ? userRepository.findByEmailIgnoreCase(currentUsername.trim())
                    .orElseThrow(() -> new AccessDeniedException("You do not have permission to view this user account."))
                    : ownershipService.getAuthenticatedUser();
            ownershipService.canAccessUser(entity, currentUser);
        }

        return mapToResponse(entity);
    }

    @Override
    @Transactional
    public UserResponse updateUser(Long userId, UserRequest request) {
        return updateUser(userId, request, null, true);
    }

    @Override
    @Transactional
    public UserResponse updateUser(Long userId, UserRequest request, String currentUsername, boolean isSuperAdmin) {
        UserEntity entity = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        if (!isSuperAdmin) {
            UserEntity currentUser = (currentUsername != null && !currentUsername.isBlank())
                    ? userRepository.findByEmailIgnoreCase(currentUsername.trim())
                    .orElseThrow(() -> new AccessDeniedException("You do not have permission to modify this user account."))
                    : ownershipService.getAuthenticatedUser();
            ownershipService.canAccessUser(entity, currentUser);
        }

        if (request.getName() != null) {
            entity.setName(request.getName());
        }
        if (request.getEmail() != null && !request.getEmail().equalsIgnoreCase(entity.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new BadRequestException("Email is already in use by another user");
            }
            entity.setEmail(request.getEmail().trim().toLowerCase());
        }
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            entity.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        if (request.getRole() != null) {
            entity.setRole(request.getRole());
        }
        if (request.getStatus() != null) {
            entity.setStatus(request.getStatus());
        }

        UserEntity updated = userRepository.save(entity);

        activityLogService.log(
                currentUsername != null ? currentUsername : "SYSTEM",
                ActivityCategory.USER,
                "USER_UPDATED",
                "User",
                "U" + updated.getUserId(),
                "Updated account details for " + updated.getEmail(),
                "SUCCESS",
                null,
                "{\"role\":\"" + updated.getRole() + "\",\"status\":\"" + updated.getStatus() + "\"}"
        );

        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteUser(Long userId) {
        deleteUser(userId, null, true);
    }

    @Override
    @Transactional
    public void deleteUser(Long userId, String currentUsername, boolean isSuperAdmin) {
        UserEntity entity = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        if (!isSuperAdmin) {
            UserEntity currentUser = (currentUsername != null && !currentUsername.isBlank())
                    ? userRepository.findByEmailIgnoreCase(currentUsername.trim())
                    .orElseThrow(() -> new AccessDeniedException("You do not have permission to delete this user account."))
                    : ownershipService.getAuthenticatedUser();
            ownershipService.canAccessUser(entity, currentUser);
        }

        userRepository.delete(entity);

        activityLogService.log(
                currentUsername != null ? currentUsername : "SYSTEM",
                ActivityCategory.USER,
                "USER_DELETED",
                "User",
                "U" + entity.getUserId(),
                "Deactivated/deleted user account " + entity.getEmail(),
                "SUCCESS",
                null,
                "{\"role\":\"" + entity.getRole() + "\",\"deletedEmail\":\"" + entity.getEmail() + "\"}"
        );
    }

    private UserResponse mapToResponse(UserEntity entity) {
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
                .createdBy(entity.getCreatedBy())
                .adminOwnerId(entity.getAdminOwnerId())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
