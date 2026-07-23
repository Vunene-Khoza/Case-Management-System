package za.ac.univen.casemanagement.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import za.ac.univen.casemanagement.dto.request.UserRequest;
import za.ac.univen.casemanagement.dto.response.UserResponse;
import za.ac.univen.casemanagement.entity.UserEntity;
import za.ac.univen.casemanagement.exception.BadRequestException;
import za.ac.univen.casemanagement.exception.ResourceNotFoundException;
import za.ac.univen.casemanagement.repository.UserRepository;
import za.ac.univen.casemanagement.service.UserService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public UserResponse createUser(UserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered: " + request.getEmail());
        }

        UserEntity entity = UserEntity.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .status(request.getStatus() != null ? request.getStatus() : "ACTIVE")
                .build();

        UserEntity saved = userRepository.save(entity);
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
            entity.setEmail(request.getEmail());
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
                .email(entity.getEmail())
                .role(entity.getRole())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
