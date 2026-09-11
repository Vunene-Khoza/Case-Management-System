package za.ac.univen.casemanagement.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import za.ac.univen.casemanagement.dto.response.ReportSummaryResponse;
import za.ac.univen.casemanagement.enums.CaseStatus;
import za.ac.univen.casemanagement.enums.CaseType;
import za.ac.univen.casemanagement.repository.CaseRepository;
import za.ac.univen.casemanagement.service.ReportService;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final CaseRepository caseRepository;
    private final za.ac.univen.casemanagement.security.OwnershipService ownershipService;

    @Override
    @Transactional(readOnly = true)
    public ReportSummaryResponse getSummaryReport() {
        za.ac.univen.casemanagement.entity.UserEntity currentUser = ownershipService.getAuthenticatedUser();
        boolean isSuperAdmin = ownershipService.isSuperAdmin(currentUser);
        Long adminOwnerId = ownershipService.resolveAdminOwnerId(currentUser);

        if (isSuperAdmin) {
            long totalCases = caseRepository.count();
            long openCases = caseRepository.countByStatus(CaseStatus.OPEN) + caseRepository.countByStatus(CaseStatus.IN_PROGRESS);
            long closedCases = caseRepository.countByStatus(CaseStatus.CLOSED);
            BigDecimal totalCosting = caseRepository.sumTotalCosting();
            if (totalCosting == null) {
                totalCosting = BigDecimal.ZERO;
            }
            long legalCount = caseRepository.countByCaseType(CaseType.LEGAL);
            long labourCount = caseRepository.countByCaseType(CaseType.LABOUR);

            return ReportSummaryResponse.builder()
                    .totalCases(totalCases)
                    .openCases(openCases)
                    .closedCases(closedCases)
                    .totalCost(totalCosting)
                    .legalCasesCount(legalCount)
                    .labourCasesCount(labourCount)
                    .build();
        }

        if (adminOwnerId == null) {
            return ReportSummaryResponse.builder()
                    .totalCases(0)
                    .openCases(0)
                    .closedCases(0)
                    .totalCost(BigDecimal.ZERO)
                    .legalCasesCount(0)
                    .labourCasesCount(0)
                    .build();
        }

        long totalCases = caseRepository.countByAdminOwnerId(adminOwnerId);
        long openCases = caseRepository.countByStatusAndAdminOwnerId(CaseStatus.OPEN, adminOwnerId)
                + caseRepository.countByStatusAndAdminOwnerId(CaseStatus.IN_PROGRESS, adminOwnerId);
        long closedCases = caseRepository.countByStatusAndAdminOwnerId(CaseStatus.CLOSED, adminOwnerId);
        BigDecimal totalCosting = caseRepository.sumTotalCostingByAdminOwnerId(adminOwnerId);
        if (totalCosting == null) {
            totalCosting = BigDecimal.ZERO;
        }
        long legalCount = caseRepository.countByCaseTypeAndAdminOwnerId(CaseType.LEGAL, adminOwnerId);
        long labourCount = caseRepository.countByCaseTypeAndAdminOwnerId(CaseType.LABOUR, adminOwnerId);

        return ReportSummaryResponse.builder()
                .totalCases(totalCases)
                .openCases(openCases)
                .closedCases(closedCases)
                .totalCost(totalCosting)
                .legalCasesCount(legalCount)
                .labourCasesCount(labourCount)
                .build();
    }
}
