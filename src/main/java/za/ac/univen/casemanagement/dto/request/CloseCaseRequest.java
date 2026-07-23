package za.ac.univen.casemanagement.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CloseCaseRequest {

    @NotNull(message = "closureDate is required on close")
    private LocalDate closureDate;

    @NotBlank(message = "finalNotes is required on close")
    @Size(min = 5, max = 1000, message = "finalNotes must be between 5 and 1000 characters")
    private String finalNotes;

    @DecimalMin(value = "0.00", message = "costing must be non-negative")
    @Digits(integer = 13, fraction = 2, message = "costing must be a valid decimal with up to 2 decimal places")
    private BigDecimal costing;
}
