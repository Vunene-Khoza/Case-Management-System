package za.ac.univen.casemanagement.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import za.ac.univen.casemanagement.enums.CaseClassification;
import za.ac.univen.casemanagement.enums.CaseType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class CreateCaseRequest {

    @NotBlank(message = "employeeNumber is required")
    @Size(min = 3, message = "employeeNumber must be at least 3 characters")
    @Pattern(regexp = "^[a-zA-Z0-9]+$", message = "employeeNumber must be alphanumeric")
    private String employeeNumber;

    @NotBlank(message = "employeeName is required")
    @Size(min = 2, max = 100, message = "employeeName must be between 2 and 100 characters")
    private String employeeName;

    @NotNull(message = "caseType is required")
    private CaseType caseType;

    @NotNull(message = "classification is required")
    private CaseClassification classification;

    @Size(max = 2000, message = "description maximum length is 2000 characters")
    private String description;

    @NotNull(message = "dateOpened is required")
    @PastOrPresent(message = "dateOpened cannot be in the future")
    private LocalDate dateOpened;

    private LocalDate trialDate;

    private List<LocalDate> reminderDates;

    @DecimalMin(value = "0.00", message = "costing must be non-negative")
    @Digits(integer = 13, fraction = 2, message = "costing must be a valid decimal with up to 2 decimal places")
    private BigDecimal costing;
}
