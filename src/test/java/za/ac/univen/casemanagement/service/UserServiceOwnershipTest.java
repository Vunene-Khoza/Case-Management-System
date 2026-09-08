package za.ac.univen.casemanagement.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import za.ac.univen.casemanagement.dto.request.CreateLegalOfficerRequest;
import za.ac.univen.casemanagement.dto.response.UserResponse;
import za.ac.univen.casemanagement.entity.UserEntity;
import za.ac.univen.casemanagement.enums.UserRole;
import za.ac.univen.casemanagement.repository.EmployeeRepository;
import za.ac.univen.casemanagement.repository.UserRepository;
import za.ac.univen.casemanagement.service.impl.UserServiceImpl;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceOwnershipTest {

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

    private UserEntity userCreatedByAdminA;
    private UserEntity userCreatedByAdminB;
    private UserEntity superAdminUser;

    @BeforeEach
    void setUp() {
        userCreatedByAdminA = UserEntity.builder()
                .userId(1L)
                .name("Officer A")
                .email("officera@univen.ac.za")
                .role(UserRole.LEGAL_OFFICER)
                .status("ACTIVE")
                .createdBy("admina@univen.ac.za")
                .build();

        userCreatedByAdminB = UserEntity.builder()
                .userId(2L)
                .name("Officer B")
                .email("officerb@univen.ac.za")
                .role(UserRole.LEGAL_OFFICER)
                .status("ACTIVE")
                .createdBy("adminb@univen.ac.za")
                .build();

        superAdminUser = UserEntity.builder()
                .userId(3L)
                .name("Super Admin")
                .email("superadmin@univen.ac.za")
                .role(UserRole.SUPER_ADMIN)
                .status("ACTIVE")
                .createdBy("SYSTEM")
                .build();
    }

    @Test
    void testSuperAdmin_CanSeeAllUsers_SystemWide() {
        when(userRepository.findAll()).thenReturn(List.of(userCreatedByAdminA, userCreatedByAdminB, superAdminUser));

        List<UserResponse> result = userService.getUsers("superadmin@univen.ac.za", true);

        assertEquals(3, result.size());
        verify(userRepository, times(1)).findAll();
        verify(userRepository, never()).findByCreatedByIgnoreCase(anyString());
    }

    @Test
    void testAdminA_CanOnlySeeOwnedUsers() {
        when(userRepository.findByCreatedByIgnoreCase("admina@univen.ac.za"))
                .thenReturn(List.of(userCreatedByAdminA));

        List<UserResponse> result = userService.getUsers("admina@univen.ac.za", false);

        assertEquals(1, result.size());
        assertEquals("officera@univen.ac.za", result.get(0).getEmail());
        assertEquals("admina@univen.ac.za", result.get(0).getCreatedBy());
        verify(userRepository, times(1)).findByCreatedByIgnoreCase("admina@univen.ac.za");
        verify(userRepository, never()).findAll();
    }

    @Test
    void testAdminA_CannotViewUserCreatedByAdminB_ThrowsAccessDenied() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(userCreatedByAdminB));

        assertThrows(AccessDeniedException.class, () -> {
            userService.getUserById(2L, "admina@univen.ac.za", false);
        });
    }

    @Test
    void testSuperAdmin_CanViewAnyUser() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(userCreatedByAdminB));

        UserResponse response = userService.getUserById(2L, "superadmin@univen.ac.za", true);

        assertNotNull(response);
        assertEquals("officerb@univen.ac.za", response.getEmail());
    }

    @Test
    void testAdminA_CannotDeleteUserCreatedByAdminB_ThrowsAccessDenied() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(userCreatedByAdminB));

        assertThrows(AccessDeniedException.class, () -> {
            userService.deleteUser(2L, "admina@univen.ac.za", false);
        });

        verify(userRepository, never()).delete(any(UserEntity.class));
    }

    @Test
    void testAdminA_CanDeleteOwnedUser() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(userCreatedByAdminA));

        userService.deleteUser(1L, "admina@univen.ac.za", false);

        verify(userRepository, times(1)).delete(userCreatedByAdminA);
    }

    @Test
    void testCreateLegalOfficerUser_StampsCreator() {
        CreateLegalOfficerRequest request = CreateLegalOfficerRequest.builder()
                .employeeNumber("40234")
                .name("Ndidzulafhi")
                .surname("Baloyi")
                .email("baloyi@univen.ac.za")
                .phoneNumber("+27 15 962 8901")
                .idNumber("8405125800084")
                .department("Faculty of Management & Law")
                .temporaryPassword("TempPass2026!")
                .build();

        when(userRepository.existsByEmail("baloyi@univen.ac.za")).thenReturn(false);
        when(userRepository.existsByEmployeeNumber("40234")).thenReturn(false);
        when(employeeRepository.existsByEmployeeNumber("40234")).thenReturn(true);
        when(passwordEncoder.encode("TempPass2026!")).thenReturn("encoded_pass");

        when(userRepository.save(any(UserEntity.class))).thenAnswer(invocation -> {
            UserEntity saved = invocation.getArgument(0);
            saved.setUserId(99L);
            return saved;
        });

        UserResponse response = userService.createLegalOfficerUser(request, "admina@univen.ac.za");

        assertNotNull(response);
        assertEquals("admina@univen.ac.za", response.getCreatedBy());
        verify(userRepository, times(1)).save(argThat(u -> "admina@univen.ac.za".equals(u.getCreatedBy())));
    }
}
