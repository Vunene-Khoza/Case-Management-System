package za.ac.univen.casemanagement.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import za.ac.univen.casemanagement.dto.request.ChangeFirstTimePasswordRequest;
import za.ac.univen.casemanagement.dto.request.LoginRequest;
import za.ac.univen.casemanagement.dto.response.AuthResponse;
import za.ac.univen.casemanagement.entity.UserEntity;
import za.ac.univen.casemanagement.enums.UserRole;
import za.ac.univen.casemanagement.exception.BadRequestException;
import za.ac.univen.casemanagement.repository.UserRepository;
import za.ac.univen.casemanagement.security.JwtTokenProvider;
import za.ac.univen.casemanagement.service.impl.AuthServiceImpl;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServicePasswordChangeTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    @InjectMocks
    private AuthServiceImpl authService;

    private UserEntity newlyCreatedAdmin;

    @BeforeEach
    void setUp() {
        newlyCreatedAdmin = UserEntity.builder()
                .userId(5L)
                .name("Ripfumelo")
                .surname("Mukosi")
                .email("mukosi@univen.ac.za")
                .password("encoded_temp_password")
                .role(UserRole.ADMIN)
                .status("ACTIVE")
                .mustChangePassword(true)
                .firstLoginCompleted(false)
                .build();
    }

    @Test
    void testLogin_ReturnsMustChangePasswordFlag() {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("mukosi@univen.ac.za");
        loginRequest.setPassword("TempPass2026!");

        when(userRepository.findByEmail("mukosi@univen.ac.za")).thenReturn(Optional.of(newlyCreatedAdmin));
        when(passwordEncoder.matches("TempPass2026!", "encoded_temp_password")).thenReturn(true);
        when(tokenProvider.generateToken(newlyCreatedAdmin)).thenReturn("jwt.token.here");

        AuthResponse authResponse = authService.login(loginRequest);

        assertNotNull(authResponse);
        assertTrue(authResponse.isMustChangePassword());
        assertFalse(authResponse.isFirstLoginCompleted());
        assertEquals("mukosi@univen.ac.za", authResponse.getEmail());
    }

    @Test
    void testChangeFirstTimePassword_Success() {
        ChangeFirstTimePasswordRequest request = ChangeFirstTimePasswordRequest.builder()
                .email("mukosi@univen.ac.za")
                .currentPassword("TempPass2026!")
                .newPassword("NewSecurePassword#2026")
                .build();

        when(userRepository.findByEmail("mukosi@univen.ac.za")).thenReturn(Optional.of(newlyCreatedAdmin));
        when(passwordEncoder.matches("TempPass2026!", "encoded_temp_password")).thenReturn(true);
        when(passwordEncoder.encode("NewSecurePassword#2026")).thenReturn("encoded_new_password");

        authService.changeFirstTimePassword(request);

        assertFalse(newlyCreatedAdmin.isMustChangePassword());
        assertTrue(newlyCreatedAdmin.isFirstLoginCompleted());
        assertEquals("encoded_new_password", newlyCreatedAdmin.getPassword());
        assertNotNull(newlyCreatedAdmin.getLastLogin());
        verify(userRepository, times(1)).save(newlyCreatedAdmin);
    }

    @Test
    void testChangeFirstTimePassword_WrongCurrentPassword_ThrowsBadRequest() {
        ChangeFirstTimePasswordRequest request = ChangeFirstTimePasswordRequest.builder()
                .email("mukosi@univen.ac.za")
                .currentPassword("WrongPassword")
                .newPassword("NewSecurePassword#2026")
                .build();

        when(userRepository.findByEmail("mukosi@univen.ac.za")).thenReturn(Optional.of(newlyCreatedAdmin));
        when(passwordEncoder.matches("WrongPassword", "encoded_temp_password")).thenReturn(false);

        assertThrows(BadRequestException.class, () -> {
            authService.changeFirstTimePassword(request);
        });
        verify(userRepository, never()).save(any(UserEntity.class));
    }

    @Test
    void testChangeFirstTimePassword_SamePassword_ThrowsBadRequest() {
        ChangeFirstTimePasswordRequest request = ChangeFirstTimePasswordRequest.builder()
                .email("mukosi@univen.ac.za")
                .currentPassword("TempPass2026!")
                .newPassword("TempPass2026!")
                .build();

        when(userRepository.findByEmail("mukosi@univen.ac.za")).thenReturn(Optional.of(newlyCreatedAdmin));
        when(passwordEncoder.matches("TempPass2026!", "encoded_temp_password")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> {
            authService.changeFirstTimePassword(request);
        });
        verify(userRepository, never()).save(any(UserEntity.class));
    }
}
