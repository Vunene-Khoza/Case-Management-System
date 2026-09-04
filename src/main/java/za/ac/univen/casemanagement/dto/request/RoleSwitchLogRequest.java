package za.ac.univen.casemanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleSwitchLogRequest {

    private Long targetUserId;

    @NotBlank(message = "Target user name is required")
    private String targetUserName;

    @NotBlank(message = "Target user email is required")
    private String targetUserEmail;

    @NotBlank(message = "Target role is required")
    private String targetRole;

    private String actionsTaken;
}
