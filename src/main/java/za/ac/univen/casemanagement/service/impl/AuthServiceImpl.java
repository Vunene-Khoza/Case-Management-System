package za.ac.univen.casemanagement.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import za.ac.univen.casemanagement.dto.request.ChangeFirstTimePasswordRequest;
import za.ac.univen.casemanagement.dto.request.LoginRequest;
import za.ac.univen.casemanagement.dto.response.AuthResponse;
import za.ac.univen.casemanagement.entity.UserEntity;
import za.ac.univen.casemanagement.exception.BadRequestException;
import za.ac.univen.casemanagement.exception.UnauthorizedException;
import za.ac.univen.casemanagement.repository.UserRepository;
import za.ac.univen.casemanagement.security.JwtTokenProvider;
import za.ac.univen.casemanagement.service.AuthService;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @Override
    public AuthResponse login(LoginRequest request) {
        UserEntity user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        if (!user.isMustChangePassword()) {
            user.setLastLogin(Instant.now());
            userRepository.save(user);
        }

        String token = tokenProvider.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getUserId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .mustChangePassword(user.isMustChangePassword())
                .firstLoginCompleted(user.isFirstLoginCompleted())
                .build();
    }

    @Override
    public void changeFirstTimePassword(ChangeFirstTimePasswordRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("User not found with email: " + email));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current temporary password does not match.");
        }

        if (request.getNewPassword().equals(request.getCurrentPassword())) {
            throw new BadRequestException("New password cannot be identical to the temporary password.");
        }

        if (request.getNewPassword().length() < 8) {
            throw new BadRequestException("New password must be at least 8 characters long.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setMustChangePassword(false);
        user.setFirstLoginCompleted(true);
        user.setLastLogin(Instant.now());
        userRepository.save(user);
    }
}
