package za.ac.univen.casemanagement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import za.ac.univen.casemanagement.enums.CaseClassification;
import za.ac.univen.casemanagement.enums.CaseStatus;
import za.ac.univen.casemanagement.enums.CaseType;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CaseResponse {
    private String caseId;
    private String employeeNumber;
    private String employeeName;
    private CaseType caseType;
    private CaseClassification classification;
    private String description;
    private LocalDate dateOpened;
    private LocalDate trialDate;
    private List<LocalDate> reminderDates;
    private CaseStatus status;
    private LocalDate closureDate;
    private String finalNotes;
    private BigDecimal costing;
    private String assignedOfficer;
    private String assignedRole;
    private String createdBy;
    private Long adminOwnerId;
    private Instant createdAt;
    private Instant updatedAt;
}
