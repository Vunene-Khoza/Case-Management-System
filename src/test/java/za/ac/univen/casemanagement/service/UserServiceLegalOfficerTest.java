package za.ac.univen.casemanagement.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import za.ac.univen.casemanagement.dto.request.CreateLegalOfficerRequest;
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
class UserServiceLegalOfficerTest {

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

    private CreateLegalOfficerRequest validRequest;

    @BeforeEach
    void setUp() {
        validRequest = CreateLegalOfficerRequest.builder()
                .employeeNumber("10025")
                .name("Tshifhiwa")
                .surname("Nemukula")
                .email("nemukula@univen.ac.za")
                .phoneNumber("+27 15 962 8222")
                .idNumber("9002025800082")
                .department("Legal Affairs & Compliance")
                .temporaryPassword("OfficerPass2026!")
                .build();
    }

    @Test
    void testCreateLegalOfficerUser_Success() {
        when(userRepository.existsByEmail("nemukula@univen.ac.za")).thenReturn(false);
        when(userRepository.existsByEmployeeNumber("10025")).thenReturn(false);
        when(employeeRepository.existsByEmployeeNumber("10025")).thenReturn(true);
        when(passwordEncoder.encode("OfficerPass2026!")).thenReturn("encoded_officer_pass");

        when(userRepository.save(any(UserEntity.class))).thenAnswer(invocation -> {
            UserEntity entity = invocation.getArgument(0);
            entity.setUserId(25L);
            return entity;
        });

        UserResponse response = userService.createLegalOfficerUser(validRequest);

        assertNotNull(response);
        assertEquals("nemukula@univen.ac.za", response.getEmail());
        assertEquals("10025", response.getEmployeeNumber());
        assertEquals(UserRole.LEGAL_OFFICER, response.getRole());
        assertTrue(response.isMustChangePassword());
        assertFalse(response.isFirstLoginCompleted());
        assertEquals("ACTIVE", response.getStatus());
        verify(userRepository, times(1)).save(any(UserEntity.class));
    }

    @Test
    void testCreateLegalOfficerUser_InvalidDomain_ThrowsBadRequest() {
        validRequest.setEmail("nemukula@external.com");

        assertThrows(BadRequestException.class, () -> {
            userService.createLegalOfficerUser(validRequest);
        });
        verify(userRepository, never()).save(any(UserEntity.class));
    }

    @Test
    void testCreateLegalOfficerUser_DuplicateEmail_ThrowsBadRequest() {
        when(userRepository.existsByEmail("nemukula@univen.ac.za")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> {
            userService.createLegalOfficerUser(validRequest);
        });
        verify(userRepository, never()).save(any(UserEntity.class));
    }

    @Test
    void testCreateLegalOfficerUser_DuplicateEmployeeNumber_ThrowsBadRequest() {
        when(userRepository.existsByEmail("nemukula@univen.ac.za")).thenReturn(false);
        when(userRepository.existsByEmployeeNumber("10025")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> {
            userService.createLegalOfficerUser(validRequest);
        });
        verify(userRepository, never()).save(any(UserEntity.class));
    }

    @Test
    void testCreateLegalOfficerUser_EmployeeNotFound_ThrowsResourceNotFound() {
        when(userRepository.existsByEmail("nemukula@univen.ac.za")).thenReturn(false);
        when(userRepository.existsByEmployeeNumber("10025")).thenReturn(false);
        when(employeeRepository.existsByEmployeeNumber("10025")).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> {
            userService.createLegalOfficerUser(validRequest);
        });
        verify(userRepository, never()).save(any(UserEntity.class));
    }
}
