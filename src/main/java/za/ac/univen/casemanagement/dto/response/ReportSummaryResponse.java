package za.ac.univen.casemanagement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportSummaryResponse {
    private long totalCases;
    private long openCases;
    private long closedCases;
    private BigDecimal totalCost;
    private long legalCasesCount;
    private long labourCasesCount;
}
