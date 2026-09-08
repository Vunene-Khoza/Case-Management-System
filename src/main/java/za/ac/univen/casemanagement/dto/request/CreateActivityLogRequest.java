package za.ac.univen.casemanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import za.ac.univen.casemanagement.enums.ActivityCategory;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateActivityLogRequest {
    @NotNull(message = "category is required")
    private ActivityCategory category;
    @NotBlank(message = "action is required")
    private String action;
    @NotBlank(message = "entityType is required")
    private String entityType;
    private String entityId;
    @NotBlank(message = "description is required")
    private String description;
    private String status;
    private String detailsJson;
}
