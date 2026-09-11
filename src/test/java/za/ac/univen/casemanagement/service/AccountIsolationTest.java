package za.ac.univen.casemanagement.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import za.ac.univen.casemanagement.dto.request.AddNoteRequest;
import za.ac.univen.casemanagement.dto.request.CreateCaseRequest;
import za.ac.univen.casemanagement.dto.request.UpdateCaseRequest;
import za.ac.univen.casemanagement.dto.response.CaseNoteResponse;
import za.ac.univen.casemanagement.dto.response.CaseResponse;
import za.ac.univen.casemanagement.dto.response.ReportSummaryResponse;
import za.ac.univen.casemanagement.dto.response.UserResponse;
import za.ac.univen.casemanagement.entity.CaseEntity;
import za.ac.univen.casemanagement.entity.CaseNoteEntity;
import za.ac.univen.casemanagement.entity.UserEntity;
import za.ac.univen.casemanagement.enums.CaseClassification;
import za.ac.univen.casemanagement.enums.CaseStatus;
import za.ac.univen.casemanagement.enums.CaseType;
import za.ac.univen.casemanagement.enums.UserRole;
import za.ac.univen.casemanagement.exception.BadRequestException;
import za.ac.univen.casemanagement.repository.CaseNoteRepository;
import za.ac.univen.casemanagement.repository.CaseRepository;
import za.ac.univen.casemanagement.repository.UserRepository;
import za.ac.univen.casemanagement.security.OwnershipService;
import za.ac.univen.casemanagement.service.impl.CaseNoteServiceImpl;
import za.ac.univen.casemanagement.service.impl.CaseServiceImpl;
import za.ac.univen.casemanagement.service.impl.ReportServiceImpl;
import za.ac.univen.casemanagement.service.impl.UserServiceImpl;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AccountIsolationTest {

    @Mock
    private CaseRepository caseRepository;

    @Mock
    private CaseNoteRepository caseNoteRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ActivityLogService activityLogService;

    @Mock
    private OwnershipService ownershipService;

    @InjectMocks
    private CaseServiceImpl caseService;

    @InjectMocks
    private CaseNoteServiceImpl caseNoteService;

    @InjectMocks
    private UserServiceImpl userService;

    @InjectMocks
    private ReportServiceImpl reportService;

    private UserEntity adminA;
    private UserEntity adminB;
    private UserEntity superAdmin;
    private UserEntity officerA;
    private CaseEntity caseA1;
    private CaseEntity caseB1;

    @BeforeEach
    void setUp() {
        adminA = UserEntity.builder()
                .userId(100L)
                .name("Admin A")
                .email("admina@univen.ac.za")
                .role(UserRole.ADMIN)
                .adminOwnerId(100L)
                .status("ACTIVE")
                .build();

        adminB = UserEntity.builder()
                .userId(200L)
                .name("Admin B")
                .email("adminb@univen.ac.za")
                .role(UserRole.ADMIN)
                .adminOwnerId(200L)
                .status("ACTIVE")
                .build();

        superAdmin = UserEntity.builder()
                .userId(1L)
                .name("Super Admin")
                .email("superadmin@univen.ac.za")
                .role(UserRole.SUPER_ADMIN)
                .status("ACTIVE")
                .build();

        officerA = UserEntity.builder()
                .userId(101L)
                .name("Officer A")
                .email("officera@univen.ac.za")
                .role(UserRole.LEGAL_OFFICER)
                .adminOwnerId(100L)
                .createdBy("admina@univen.ac.za")
                .status("ACTIVE")
                .build();

        caseA1 = CaseEntity.builder()
                .caseId("C001")
                .employeeNumber("10012")
                .employeeName("Ripfumelo Mukosi")
                .caseType(CaseType.LEGAL)
                .classification(CaseClassification.DISCIPLINARY)
                .status(CaseStatus.OPEN)
                .costing(new BigDecimal("15000.00"))
                .createdBy("admina@univen.ac.za")
                .adminOwnerId(100L)
                .build();

        caseB1 = CaseEntity.builder()
                .caseId("C002")
                .employeeNumber("12345")
                .employeeName("Tshilidzi Avhashoni")
                .caseType(CaseType.LABOUR)
                .classification(CaseClassification.DISPUTE)
                .status(CaseStatus.OPEN)
                .costing(new BigDecimal("25000.00"))
                .createdBy("adminb@univen.ac.za")
                .adminOwnerId(200L)
                .build();
    }

    // --- TEST 1: New Admin starts at ground level (zero state) ---
    @Test
    void test1_NewAdmin_StartsFromGroundLevel_ZeroCasesAndZeroUsers() {
        UserEntity newAdmin = UserEntity.builder()
                .userId(300L)
                .name("New Admin")
                .email("newadmin@univen.ac.za")
                .role(UserRole.ADMIN)
                .adminOwnerId(300L)
                .build();

        when(ownershipService.getAuthenticatedUser()).thenReturn(newAdmin);
        when(ownershipService.isSuperAdmin(newAdmin)).thenReturn(false);
        when(ownershipService.resolveAdminOwnerId(newAdmin)).thenReturn(300L);

        // Cases query returns empty
        Pageable pageable = PageRequest.of(0, 10);
        when(caseRepository.searchScopedCases(eq(false), eq(300L), isNull(), isNull(), isNull(), eq(pageable)))
                .thenReturn(Page.empty());

        Page<CaseResponse> casesPage = caseService.getCases(null, null, null, pageable);
        assertEquals(0, casesPage.getTotalElements());

        // Users query returns empty
        when(userRepository.findByEmailIgnoreCase("newadmin@univen.ac.za")).thenReturn(Optional.of(newAdmin));
        when(userRepository.findByAdminOwnerIdAndRoleNot(300L, UserRole.ADMIN)).thenReturn(List.of());

        List<UserResponse> users = userService.getUsers("newadmin@univen.ac.za", false);
        assertTrue(users.isEmpty());

        // Dashboard reports returns 0 metrics
        when(caseRepository.countByAdminOwnerId(300L)).thenReturn(0L);
        when(caseRepository.countByStatusAndAdminOwnerId(CaseStatus.OPEN, 300L)).thenReturn(0L);
        when(caseRepository.countByStatusAndAdminOwnerId(CaseStatus.IN_PROGRESS, 300L)).thenReturn(0L);
        when(caseRepository.countByStatusAndAdminOwnerId(CaseStatus.CLOSED, 300L)).thenReturn(0L);
        when(caseRepository.sumTotalCostingByAdminOwnerId(300L)).thenReturn(BigDecimal.ZERO);
        when(caseRepository.countByCaseTypeAndAdminOwnerId(CaseType.LEGAL, 300L)).thenReturn(0L);
        when(caseRepository.countByCaseTypeAndAdminOwnerId(CaseType.LABOUR, 300L)).thenReturn(0L);

        ReportSummaryResponse summary = reportService.getSummaryReport();
        assertEquals(0, summary.getTotalCases());
        assertEquals(0, summary.getOpenCases());
        assertEquals(0, summary.getClosedCases());
        assertEquals(BigDecimal.ZERO, summary.getTotalCost());
    }

    // --- TEST 2: Admin A creates Case A1 ---
    @Test
    void test2_AdminACreatesCase_ScopedToAdminA() {
        when(ownershipService.getAuthenticatedUser()).thenReturn(adminA);
        when(ownershipService.resolveAdminOwnerId(adminA)).thenReturn(100L);
        when(caseRepository.findMaxCaseId()).thenReturn(Optional.of("C000"));

        CreateCaseRequest request = new CreateCaseRequest();
        request.setEmployeeNumber("10012");
        request.setEmployeeName("Ripfumelo Mukosi");
        request.setCaseType(CaseType.LEGAL);
        request.setClassification(CaseClassification.DISCIPLINARY);
        request.setDateOpened(LocalDate.now());
        request.setCosting(new BigDecimal("15000.00"));

        when(caseRepository.save(any(CaseEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        CaseResponse created = caseService.createCase(request);

        assertNotNull(created);
        assertEquals("C001", created.getCaseId());
        assertEquals("admina@univen.ac.za", created.getCreatedBy());
        assertEquals(100L, created.getAdminOwnerId());
    }

    // --- TEST 3: Admin B creates Case B1; Isolation between workspaces ---
    @Test
    void test3_WorkspaceIsolation_AdminASeesOnlyA1_AdminBSeesOnlyB1_SuperAdminSeesBoth() {
        Pageable pageable = PageRequest.of(0, 10);

        // Admin A queries cases
        when(ownershipService.getAuthenticatedUser()).thenReturn(adminA);
        when(ownershipService.isSuperAdmin(adminA)).thenReturn(false);
        when(ownershipService.resolveAdminOwnerId(adminA)).thenReturn(100L);
        when(caseRepository.searchScopedCases(eq(false), eq(100L), isNull(), isNull(), isNull(), eq(pageable)))
                .thenReturn(new PageImpl<>(List.of(caseA1)));

        Page<CaseResponse> adminACases = caseService.getCases(null, null, null, pageable);
        assertEquals(1, adminACases.getTotalElements());
        assertEquals("C001", adminACases.getContent().get(0).getCaseId());

        // Admin B queries cases
        when(ownershipService.getAuthenticatedUser()).thenReturn(adminB);
        when(ownershipService.isSuperAdmin(adminB)).thenReturn(false);
        when(ownershipService.resolveAdminOwnerId(adminB)).thenReturn(200L);
        when(caseRepository.searchScopedCases(eq(false), eq(200L), isNull(), isNull(), isNull(), eq(pageable)))
                .thenReturn(new PageImpl<>(List.of(caseB1)));

        Page<CaseResponse> adminBCases = caseService.getCases(null, null, null, pageable);
        assertEquals(1, adminBCases.getTotalElements());
        assertEquals("C002", adminBCases.getContent().get(0).getCaseId());

        // Super Admin queries cases
        when(ownershipService.getAuthenticatedUser()).thenReturn(superAdmin);
        when(ownershipService.isSuperAdmin(superAdmin)).thenReturn(true);
        when(ownershipService.resolveAdminOwnerId(superAdmin)).thenReturn(null);
        when(caseRepository.searchScopedCases(eq(true), isNull(), isNull(), isNull(), isNull(), eq(pageable)))
                .thenReturn(new PageImpl<>(List.of(caseA1, caseB1)));

        Page<CaseResponse> superAdminCases = caseService.getCases(null, null, null, pageable);
        assertEquals(2, superAdminCases.getTotalElements());
    }

    // --- TEST 4: Direct URL attack (IDOR) - Admin B cannot view, update, or add note to Case A1 ---
    @Test
    void test4_DirectUrlAttack_AdminBCannotAccessOrModifyCaseA1_ThrowsAccessDenied() {
        when(ownershipService.getAuthenticatedUser()).thenReturn(adminB);
        when(caseRepository.findById("C001")).thenReturn(Optional.of(caseA1));
        doThrow(new AccessDeniedException("Access denied: You do not have permission to access or modify this case."))
                .when(ownershipService).canAccessCase(caseA1, adminB);

        // GET /cases/C001
        assertThrows(AccessDeniedException.class, () -> caseService.getCaseById("C001"));

        // PUT /cases/C001
        UpdateCaseRequest updateReq = new UpdateCaseRequest();
        updateReq.setDescription("Tampered");
        assertThrows(AccessDeniedException.class, () -> caseService.updateCase("C001", updateReq));

        // POST /cases/C001/notes
        AddNoteRequest noteReq = new AddNoteRequest();
        noteReq.setContent("Unauthorized note");
        assertThrows(AccessDeniedException.class, () -> caseNoteService.addNote("C001", noteReq, "adminb@univen.ac.za"));
    }

    // --- TEST 5: Legal Officer Isolation & Invalid Assignment ---
    @Test
    void test5_LegalOfficerIsolation_AdminBCannotAssignOfficerOwnedByAdminA() {
        when(ownershipService.getAuthenticatedUser()).thenReturn(adminB);
        when(ownershipService.resolveAdminOwnerId(adminB)).thenReturn(200L);
        doThrow(new BadRequestException("Assigned Legal Officer 'Officer A' does not belong to your administrative workspace."))
                .when(ownershipService).validateOfficerAssignment("Officer A", 200L);

        CreateCaseRequest request = new CreateCaseRequest();
        request.setEmployeeNumber("12345");
        request.setEmployeeName("Test Employee");
        request.setCaseType(CaseType.LABOUR);
        request.setClassification(CaseClassification.DISCIPLINARY);
        request.setAssignedOfficer("Officer A"); // Belongs to Admin A, not Admin B!

        assertThrows(BadRequestException.class, () -> caseService.createCase(request));
    }

    // --- TEST 6: Case Note Isolation - Note inherits adminOwnerId ---
    @Test
    void test6_CaseNote_InheritsParentCaseAdminOwnerId() {
        when(caseRepository.findById("C001")).thenReturn(Optional.of(caseA1));
        when(userRepository.findByEmailIgnoreCase("admina@univen.ac.za")).thenReturn(Optional.of(adminA));

        when(caseNoteRepository.save(any(CaseNoteEntity.class))).thenAnswer(inv -> {
            CaseNoteEntity note = inv.getArgument(0);
            note.setNoteId(10L);
            return note;
        });

        AddNoteRequest noteReq = new AddNoteRequest();
        noteReq.setContent("Disciplinary hearing postponed.");
        CaseNoteResponse noteResponse = caseNoteService.addNote("C001", noteReq, "admina@univen.ac.za");

        assertNotNull(noteResponse);
        assertEquals(100L, noteResponse.getAdminOwnerId());
        assertEquals("C001", noteResponse.getCaseId());
    }

    // --- TEST 7: Dashboard isolation - Metrics strictly reflect workspace data ---
    @Test
    void test7_DashboardIsolation_MetricsStrictlyReflectAdminWorkspace() {
        // Admin A dashboard
        when(ownershipService.getAuthenticatedUser()).thenReturn(adminA);
        when(ownershipService.isSuperAdmin(adminA)).thenReturn(false);
        when(ownershipService.resolveAdminOwnerId(adminA)).thenReturn(100L);

        when(caseRepository.countByAdminOwnerId(100L)).thenReturn(5L);
        when(caseRepository.countByStatusAndAdminOwnerId(CaseStatus.OPEN, 100L)).thenReturn(4L);
        when(caseRepository.countByStatusAndAdminOwnerId(CaseStatus.IN_PROGRESS, 100L)).thenReturn(0L);
        when(caseRepository.countByStatusAndAdminOwnerId(CaseStatus.CLOSED, 100L)).thenReturn(1L);
        when(caseRepository.sumTotalCostingByAdminOwnerId(100L)).thenReturn(new BigDecimal("75000.00"));
        when(caseRepository.countByCaseTypeAndAdminOwnerId(CaseType.LEGAL, 100L)).thenReturn(3L);
        when(caseRepository.countByCaseTypeAndAdminOwnerId(CaseType.LABOUR, 100L)).thenReturn(2L);

        ReportSummaryResponse adminAReport = reportService.getSummaryReport();
        assertEquals(5, adminAReport.getTotalCases());
        assertEquals(4, adminAReport.getOpenCases());
        assertEquals(1, adminAReport.getClosedCases());
        assertEquals(new BigDecimal("75000.00"), adminAReport.getTotalCost());

        // Admin B dashboard
        when(ownershipService.getAuthenticatedUser()).thenReturn(adminB);
        when(ownershipService.isSuperAdmin(adminB)).thenReturn(false);
        when(ownershipService.resolveAdminOwnerId(adminB)).thenReturn(200L);

        when(caseRepository.countByAdminOwnerId(200L)).thenReturn(2L);
        when(caseRepository.countByStatusAndAdminOwnerId(CaseStatus.OPEN, 200L)).thenReturn(2L);
        when(caseRepository.countByStatusAndAdminOwnerId(CaseStatus.IN_PROGRESS, 200L)).thenReturn(0L);
        when(caseRepository.countByStatusAndAdminOwnerId(CaseStatus.CLOSED, 200L)).thenReturn(0L);
        when(caseRepository.sumTotalCostingByAdminOwnerId(200L)).thenReturn(new BigDecimal("20000.00"));
        when(caseRepository.countByCaseTypeAndAdminOwnerId(CaseType.LEGAL, 200L)).thenReturn(1L);
        when(caseRepository.countByCaseTypeAndAdminOwnerId(CaseType.LABOUR, 200L)).thenReturn(1L);

        ReportSummaryResponse adminBReport = reportService.getSummaryReport();
        assertEquals(2, adminBReport.getTotalCases());
        assertEquals(2, adminBReport.getOpenCases());
        assertEquals(0, adminBReport.getClosedCases());
        assertEquals(new BigDecimal("20000.00"), adminBReport.getTotalCost());
    }
}
