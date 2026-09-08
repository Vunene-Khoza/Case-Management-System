package za.ac.univen.casemanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoleSwitchLogRequest {
    private Long targetUserId;
    @NotBlank(message = "targetUserName is required")
    private String targetUserName;
    @NotBlank(message = "targetUserEmail is required")
    private String targetUserEmail;
    @NotBlank(message = "targetRole is required")
    private String targetRole;
    private String actionsTaken;
}
