package za.ac.univen.casemanagement.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import za.ac.univen.casemanagement.dto.request.CreateAdminRequest;
import za.ac.univen.casemanagement.dto.request.UserRequest;
import za.ac.univen.casemanagement.dto.response.UserResponse;
import za.ac.univen.casemanagement.entity.UserEntity;
import za.ac.univen.casemanagement.enums.UserRole;
import za.ac.univen.casemanagement.exception.BadRequestException;
import za.ac.univen.casemanagement.exception.ResourceNotFoundException;
import za.ac.univen.casemanagement.repository.EmployeeRepository;
import za.ac.univen.casemanagement.repository.UserRepository;
import za.ac.univen.casemanagement.service.UserService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

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
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public UserResponse createAdminUser(CreateAdminRequest request) {
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
                .build();

        UserEntity saved = userRepository.save(adminEntity);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long userId) {
        UserEntity entity = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        return mapToResponse(entity);
    }

    @Override
    @Transactional
    public UserResponse updateUser(Long userId, UserRequest request) {
        UserEntity entity = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

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
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with ID: " + userId);
        }
        userRepository.deleteById(userId);
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
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
