package za.ac.univen.casemanagement.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import za.ac.univen.casemanagement.dto.request.RoleSwitchLogRequest;
import za.ac.univen.casemanagement.dto.response.ActivityLogResponse;
import za.ac.univen.casemanagement.entity.ActivityLogEntity;
import za.ac.univen.casemanagement.entity.UserEntity;
import za.ac.univen.casemanagement.enums.ActivityCategory;
import za.ac.univen.casemanagement.enums.UserRole;
import za.ac.univen.casemanagement.repository.ActivityLogRepository;
import za.ac.univen.casemanagement.repository.UserRepository;
import za.ac.univen.casemanagement.service.impl.ActivityLogServiceImpl;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ActivityLogServiceScopingTest {

    @Mock
    private ActivityLogRepository activityLogRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ActivityLogServiceImpl activityLogService;

    private UserEntity adminA;
    private UserEntity officerA;
    private UserEntity superAdmin;

    @BeforeEach
    void setUp() {
        superAdmin = UserEntity.builder()
                .userId(1L)
                .name("Super")
                .surname("Admin")
                .email("superadmin@univen.ac.za")
                .role(UserRole.SUPER_ADMIN)
                .createdBy("SYSTEM")
                .build();

        adminA = UserEntity.builder()
                .userId(2L)
                .name("Admin")
                .surname("Alpha")
                .email("admina@univen.ac.za")
                .role(UserRole.ADMIN)
                .adminOwnerId(2L)
                .createdBy("superadmin@univen.ac.za")
                .build();

        officerA = UserEntity.builder()
                .userId(3L)
                .name("Officer")
                .surname("Alpha")
                .email("officera@univen.ac.za")
                .role(UserRole.LEGAL_OFFICER)
                .adminOwnerId(2L)
                .createdBy("admina@univen.ac.za")
                .build();
    }

    @Test
    void getLogs_AsSuperAdmin_CallsScopedQueryWithSuperAdminFlag() {
        Authentication auth = new UsernamePasswordAuthenticationToken(
                "superadmin@univen.ac.za",
                "pwd",
                List.of(new SimpleGrantedAuthority("ROLE_SUPER_ADMIN"))
        );
        Pageable pageable = PageRequest.of(0, 10);
        when(activityLogRepository.findScopedLogs(eq(true), eq(false), any(), isNull(), eq(false), any(), isNull(), isNull(), isNull(), eq(pageable)))
                .thenReturn(new PageImpl<>(List.of(
                        ActivityLogEntity.builder().id(101L).action("CASE_CREATED").category(ActivityCategory.CASE).build()
                )));

        Page<ActivityLogResponse> result = activityLogService.getLogs(null, null, null, pageable, auth, null, null);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        verify(activityLogRepository).findScopedLogs(eq(true), eq(false), eq("superadmin@univen.ac.za"), isNull(), eq(false), eq("superadmin@univen.ac.za"), isNull(), isNull(), isNull(), eq(pageable));
    }

    @Test
    void getLogs_AsAdmin_ScopesToAdminOwnership() {
        Authentication auth = new UsernamePasswordAuthenticationToken(
                "admina@univen.ac.za",
                "pwd",
                List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
        );
        Pageable pageable = PageRequest.of(0, 10);
        when(userRepository.findByEmailIgnoreCase("admina@univen.ac.za")).thenReturn(Optional.of(adminA));
        when(activityLogRepository.findScopedLogs(eq(false), eq(true), eq("admina@univen.ac.za"), eq(2L), eq(false), eq("admina@univen.ac.za"), isNull(), isNull(), isNull(), eq(pageable)))
                .thenReturn(new PageImpl<>(List.of(
                        ActivityLogEntity.builder().id(102L).action("USER_CREATED").actorAdminOwner("admina@univen.ac.za").category(ActivityCategory.USER).build()
                )));

        Page<ActivityLogResponse> result = activityLogService.getLogs(null, null, null, pageable, auth, null, null);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("USER_CREATED", result.getContent().get(0).getAction());
        verify(activityLogRepository).findScopedLogs(eq(false), eq(true), eq("admina@univen.ac.za"), eq(2L), eq(false), eq("admina@univen.ac.za"), isNull(), isNull(), isNull(), eq(pageable));
    }

    @Test
    void getLogs_WhenSuperAdminPreviewsAdmin_ScopesToPreviewedAdmin() {
        Authentication auth = new UsernamePasswordAuthenticationToken(
                "superadmin@univen.ac.za",
                "pwd",
                List.of(new SimpleGrantedAuthority("ROLE_SUPER_ADMIN"))
        );
        Pageable pageable = PageRequest.of(0, 10);
        when(userRepository.findByEmailIgnoreCase("admina@univen.ac.za")).thenReturn(Optional.of(adminA));
        when(activityLogRepository.findScopedLogs(eq(false), eq(true), eq("admina@univen.ac.za"), eq(2L), eq(false), eq("admina@univen.ac.za"), isNull(), isNull(), isNull(), eq(pageable)))
                .thenReturn(new PageImpl<>(List.of(
                        ActivityLogEntity.builder().id(102L).action("USER_CREATED").actorAdminOwner("admina@univen.ac.za").category(ActivityCategory.USER).build()
                )));

        Page<ActivityLogResponse> result = activityLogService.getLogs(null, null, null, pageable, auth, "ADMIN", "admina@univen.ac.za");

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("USER_CREATED", result.getContent().get(0).getAction());
        verify(activityLogRepository).findScopedLogs(eq(false), eq(true), eq("admina@univen.ac.za"), eq(2L), eq(false), eq("admina@univen.ac.za"), isNull(), isNull(), isNull(), eq(pageable));
    }

    @Test
    void getLogs_AsLegalOfficer_ScopesToOfficerEmail() {
        Authentication auth = new UsernamePasswordAuthenticationToken(
                "officera@univen.ac.za",
                "pwd",
                List.of(new SimpleGrantedAuthority("ROLE_LEGAL_OFFICER"))
        );
        Pageable pageable = PageRequest.of(0, 10);
        when(userRepository.findByEmailIgnoreCase("officera@univen.ac.za")).thenReturn(Optional.of(officerA));
        when(activityLogRepository.findScopedLogs(eq(false), eq(false), eq("officera@univen.ac.za"), eq(2L), eq(true), eq("officera@univen.ac.za"), isNull(), isNull(), isNull(), eq(pageable)))
                .thenReturn(new PageImpl<>(List.of(
                        ActivityLogEntity.builder().id(103L).action("NOTE_ADDED").userEmail("officera@univen.ac.za").category(ActivityCategory.CASE).build()
                )));

        Page<ActivityLogResponse> result = activityLogService.getLogs(null, null, null, pageable, auth, null, null);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("NOTE_ADDED", result.getContent().get(0).getAction());
        verify(activityLogRepository).findScopedLogs(eq(false), eq(false), eq("officera@univen.ac.za"), eq(2L), eq(true), eq("officera@univen.ac.za"), isNull(), isNull(), isNull(), eq(pageable));
    }

    @Test
    void log_WhenAdminActs_AssignsActorAdminOwnerToAdminEmail() {
        when(userRepository.findByEmailIgnoreCase("admina@univen.ac.za")).thenReturn(Optional.of(adminA));

        activityLogService.log(
                "admina@univen.ac.za",
                ActivityCategory.USER,
                "USER_CREATED",
                "User",
                "U003",
                "Created new Legal Officer",
                "SUCCESS",
                "192.168.1.5",
                null
        );

        ArgumentCaptor<ActivityLogEntity> captor = ArgumentCaptor.forClass(ActivityLogEntity.class);
        verify(activityLogRepository).save(captor.capture());
        ActivityLogEntity saved = captor.getValue();

        assertEquals("admina@univen.ac.za", saved.getUserEmail());
        assertEquals("admina@univen.ac.za", saved.getActorAdminOwner());
        assertEquals("ADMIN", saved.getUserRole());
    }

    @Test
    void log_WhenLegalOfficerActs_AssignsActorAdminOwnerToManagingAdmin() {
        when(userRepository.findByEmailIgnoreCase("officera@univen.ac.za")).thenReturn(Optional.of(officerA));

        activityLogService.log(
                "officera@univen.ac.za",
                ActivityCategory.CASE,
                "CASE_CREATED",
                "Case",
                "C010",
                "Registered new case",
                "SUCCESS",
                "192.168.1.10",
                null
        );

        ArgumentCaptor<ActivityLogEntity> captor = ArgumentCaptor.forClass(ActivityLogEntity.class);
        verify(activityLogRepository).save(captor.capture());
        ActivityLogEntity saved = captor.getValue();

        assertEquals("officera@univen.ac.za", saved.getUserEmail());
        assertEquals("admina@univen.ac.za", saved.getActorAdminOwner()); // Inherited from officerA.createdBy
        assertEquals("LEGAL_OFFICER", saved.getUserRole());
    }

    @Test
    void recordRoleSwitch_LogsSecurityEventUnderSystem() {
        when(userRepository.findByEmailIgnoreCase("superadmin@univen.ac.za")).thenReturn(Optional.of(superAdmin));

        Authentication auth = new UsernamePasswordAuthenticationToken(
                "superadmin@univen.ac.za",
                "pwd",
                List.of(new SimpleGrantedAuthority("ROLE_SUPER_ADMIN"))
        );

        RoleSwitchLogRequest request = RoleSwitchLogRequest.builder()
                .targetUserId(2L)
                .targetUserName("Admin Alpha")
                .targetUserEmail("admina@univen.ac.za")
                .targetRole("ADMIN")
                .actionsTaken("Super Admin previewing Admin workspace")
                .build();

        ActivityLogResponse response = activityLogService.recordRoleSwitch(request, auth, "10.0.0.1");

        assertNotNull(response);
        assertEquals("ROLE_SWITCHED", response.getAction());
        assertEquals(ActivityCategory.SECURITY, response.getCategory());

        ArgumentCaptor<ActivityLogEntity> captor = ArgumentCaptor.forClass(ActivityLogEntity.class);
        verify(activityLogRepository).save(captor.capture());
        ActivityLogEntity saved = captor.getValue();

        assertEquals("ROLE_SWITCHED", saved.getAction());
        assertEquals(ActivityCategory.SECURITY, saved.getCategory());
        assertEquals("SYSTEM", saved.getActorAdminOwner());
    }
}
