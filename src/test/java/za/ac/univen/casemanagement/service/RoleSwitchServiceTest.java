package za.ac.univen.casemanagement.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import za.ac.univen.casemanagement.dto.request.RoleSwitchLogRequest;
import za.ac.univen.casemanagement.dto.response.RoleCountResponse;
import za.ac.univen.casemanagement.dto.response.RoleSwitchLogResponse;
import za.ac.univen.casemanagement.dto.response.UserResponse;
import za.ac.univen.casemanagement.entity.RoleSwitchLogEntity;
import za.ac.univen.casemanagement.entity.UserEntity;
import za.ac.univen.casemanagement.enums.UserRole;
import za.ac.univen.casemanagement.repository.RoleSwitchLogRepository;
import za.ac.univen.casemanagement.repository.UserRepository;
import za.ac.univen.casemanagement.service.impl.RoleSwitchServiceImpl;

import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RoleSwitchServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleSwitchLogRepository roleSwitchLogRepository;

    @InjectMocks
    private RoleSwitchServiceImpl roleSwitchService;

    private UserEntity sampleAdmin;
    private UserEntity sampleOfficer;

    @BeforeEach
    void setUp() {
        sampleAdmin = UserEntity.builder()
                .userId(101L)
                .name("System Admin")
                .surname("Admin")
                .email("admin@univen.ac.za")
                .employeeNumber("00002")
                .role(UserRole.ADMIN)
                .status("ACTIVE")
                .build();

        sampleOfficer = UserEntity.builder()
                .userId(102L)
                .name("Adv. D. Blundin")
                .surname("Blundin")
                .email("officer@univen.ac.za")
                .employeeNumber("00003")
                .role(UserRole.LEGAL_OFFICER)
                .status("ACTIVE")
                .build();
    }

    @Test
    void testGetRoleCounts() {
        when(userRepository.countByRoleAndStatus(UserRole.ADMIN, "ACTIVE")).thenReturn(2L);
        when(userRepository.countByRoleAndStatus(UserRole.LEGAL_OFFICER, "ACTIVE")).thenReturn(3L);
        when(userRepository.countByRoleAndStatus(UserRole.VIEWER, "ACTIVE")).thenReturn(2L);
        when(userRepository.countByRoleAndStatus(UserRole.SUPER_ADMIN, "ACTIVE")).thenReturn(1L);

        RoleCountResponse counts = roleSwitchService.getRoleCounts();

        assertNotNull(counts);
        assertEquals(2, counts.getAdminCount());
        assertEquals(3, counts.getLegalOfficerCount());
        assertEquals(2, counts.getViewerCount());
        assertEquals(1, counts.getSuperAdminCount());
    }

    @Test
    void testGetUsersByRole() {
        when(userRepository.findByRoleAndStatus(UserRole.ADMIN, "ACTIVE")).thenReturn(List.of(sampleAdmin));

        List<UserResponse> users = roleSwitchService.getUsersByRole(UserRole.ADMIN);

        assertNotNull(users);
        assertEquals(1, users.size());
        assertEquals("admin@univen.ac.za", users.get(0).getEmail());
        assertEquals(UserRole.ADMIN, users.get(0).getRole());
    }

    @Test
    void testLogRoleSwitch() {
        RoleSwitchLogRequest request = RoleSwitchLogRequest.builder()
                .targetUserId(102L)
                .targetUserName("Adv. D. Blundin")
                .targetUserEmail("officer@univen.ac.za")
                .targetRole("LEGAL_OFFICER")
                .actionsTaken("Previewing case work")
                .build();

        RoleSwitchLogEntity savedEntity = RoleSwitchLogEntity.builder()
                .logId(1L)
                .superAdminEmail("superadmin@univen.ac.za")
                .targetUserId(102L)
                .targetUserName("Adv. D. Blundin")
                .targetUserEmail("officer@univen.ac.za")
                .targetRole(UserRole.LEGAL_OFFICER)
                .duration("Just now")
                .actionsTaken("Previewing case work")
                .createdAt(Instant.now())
                .build();

        when(roleSwitchLogRepository.save(any(RoleSwitchLogEntity.class))).thenReturn(savedEntity);

        RoleSwitchLogResponse response = roleSwitchService.logRoleSwitch(request, "superadmin@univen.ac.za");

        assertNotNull(response);
        assertEquals("Adv. D. Blundin", response.getTargetUserName());
        assertEquals("officer@univen.ac.za", response.getTargetUserEmail());
        assertEquals("badge-officer", response.getBadgeClass());
        assertTrue(response.getSwitchedTo().contains("Legal Officer View"));
        verify(roleSwitchLogRepository, times(1)).save(any(RoleSwitchLogEntity.class));
    }

    @Test
    void testGetRoleSwitchHistory() {
        RoleSwitchLogEntity logItem = RoleSwitchLogEntity.builder()
                .logId(1L)
                .superAdminEmail("superadmin@univen.ac.za")
                .targetUserName("System Admin")
                .targetUserEmail("admin@univen.ac.za")
                .targetRole(UserRole.ADMIN)
                .duration("12 min")
                .actionsTaken("Reviewed user management screen")
                .createdAt(Instant.now())
                .build();

        when(roleSwitchLogRepository.findTop50ByOrderByCreatedAtDesc()).thenReturn(List.of(logItem));

        List<RoleSwitchLogResponse> history = roleSwitchService.getRoleSwitchHistory();

        assertNotNull(history);
        assertEquals(1, history.size());
        assertEquals("badge-admin", history.get(0).getBadgeClass());
        assertTrue(history.get(0).getSwitchedTo().contains("Admin View"));
    }
}
