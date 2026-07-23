package za.ac.univen.casemanagement.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Size;
import lombok.Data;
import za.ac.univen.casemanagement.enums.CaseClassification;
import za.ac.univen.casemanagement.enums.CaseStatus;
import za.ac.univen.casemanagement.enums.CaseType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class UpdateCaseRequest {

    @Size(min = 3, message = "employeeNumber must be at least 3 characters")
    private String employeeNumber;

    @Size(min = 2, max = 100, message = "employeeName must be between 2 and 100 characters")
    private String employeeName;

    private CaseType caseType;

    private CaseClassification classification;

    @Size(max = 2000, message = "description maximum length is 2000 characters")
    private String description;

    private LocalDate trialDate;

    private List<LocalDate> reminderDates;

    private CaseStatus status;

    @DecimalMin(value = "0.00", message = "costing must be non-negative")
    @Digits(integer = 13, fraction = 2, message = "costing must be a valid decimal with up to 2 decimal places")
    private BigDecimal costing;
}
