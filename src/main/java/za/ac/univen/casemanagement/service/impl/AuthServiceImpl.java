package za.ac.univen.casemanagement.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import za.ac.univen.casemanagement.dto.request.LoginRequest;
import za.ac.univen.casemanagement.dto.response.AuthResponse;
import za.ac.univen.casemanagement.entity.UserEntity;
import za.ac.univen.casemanagement.exception.UnauthorizedException;
import za.ac.univen.casemanagement.repository.UserRepository;
import za.ac.univen.casemanagement.security.JwtTokenProvider;
import za.ac.univen.casemanagement.service.AuthService;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @Override
    public AuthResponse login(LoginRequest request) {
        UserEntity user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        String token = tokenProvider.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getUserId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }
}
