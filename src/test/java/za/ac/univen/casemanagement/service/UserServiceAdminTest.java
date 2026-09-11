package za.ac.univen.casemanagement.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import za.ac.univen.casemanagement.dto.request.CreateAdminRequest;
import za.ac.univen.casemanagement.dto.response.UserResponse;
import za.ac.univen.casemanagement.entity.UserEntity;
import za.ac.univen.casemanagement.enums.UserRole;
import za.ac.univen.casemanagement.exception.BadRequestException;
import za.ac.univen.casemanagement.exception.ResourceNotFoundException;
import za.ac.univen.casemanagement.repository.EmployeeRepository;
import za.ac.univen.casemanagement.repository.UserRepository;
import za.ac.univen.casemanagement.service.impl.UserServiceImpl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceAdminTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private ActivityLogService activityLogService;

    @InjectMocks
    private UserServiceImpl userService;

    private CreateAdminRequest validRequest;

    @BeforeEach
    void setUp() {
        validRequest = CreateAdminRequest.builder()
                .employeeNumber("10012")
                .name("Ripfumelo")
                .surname("Mukosi")
                .email("mukosi@univen.ac.za")
                .phoneNumber("+27 15 962 8000")
                .idNumber("8501015800081")
                .department("Department of Legal Services")
                .temporaryPassword("TempPass2026!")
                .build();
    }

    @Test
    void testCreateAdminUser_Success() {
        when(userRepository.existsByEmail("mukosi@univen.ac.za")).thenReturn(false);
        when(userRepository.existsByEmployeeNumber("10012")).thenReturn(false);
        when(employeeRepository.existsByEmployeeNumber("10012")).thenReturn(true);
        when(passwordEncoder.encode("TempPass2026!")).thenReturn("encoded_temp_pass");

        when(userRepository.save(any(UserEntity.class))).thenAnswer(invocation -> {
            UserEntity entity = invocation.getArgument(0);
            entity.setUserId(10L);
            return entity;
        });

        UserResponse response = userService.createAdminUser(validRequest);

        assertNotNull(response);
        assertEquals("mukosi@univen.ac.za", response.getEmail());
        assertEquals("10012", response.getEmployeeNumber());
        assertEquals(UserRole.ADMIN, response.getRole());
        assertTrue(response.isMustChangePassword());
        assertFalse(response.isFirstLoginCompleted());
        assertEquals("ACTIVE", response.getStatus());
        verify(userRepository, atLeastOnce()).save(any(UserEntity.class));
    }

    @Test
    void testCreateAdminUser_InvalidDomain_ThrowsBadRequest() {
        validRequest.setEmail("mukosi@gmail.com");

        assertThrows(BadRequestException.class, () -> {
            userService.createAdminUser(validRequest);
        });
        verify(userRepository, never()).save(any(UserEntity.class));
    }

    @Test
    void testCreateAdminUser_DuplicateEmail_ThrowsBadRequest() {
        when(userRepository.existsByEmail("mukosi@univen.ac.za")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> {
            userService.createAdminUser(validRequest);
        });
        verify(userRepository, never()).save(any(UserEntity.class));
    }

    @Test
    void testCreateAdminUser_StaffNotFoundInOfficialDirectory_ThrowsNotFound() {
        when(userRepository.existsByEmail("mukosi@univen.ac.za")).thenReturn(false);
        when(userRepository.existsByEmployeeNumber("10012")).thenReturn(false);
        when(employeeRepository.existsByEmployeeNumber("10012")).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> {
            userService.createAdminUser(validRequest);
        });
        verify(userRepository, never()).save(any(UserEntity.class));
    }
}
