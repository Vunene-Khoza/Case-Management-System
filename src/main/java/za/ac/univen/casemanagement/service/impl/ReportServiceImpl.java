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

    @Override
    @Transactional(readOnly = true)
    public ReportSummaryResponse getSummaryReport() {
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
}
