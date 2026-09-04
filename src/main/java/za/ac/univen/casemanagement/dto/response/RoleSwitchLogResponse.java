package za.ac.univen.casemanagement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleSwitchLogResponse {
    private Long logId;
    private String timestamp;
    private String switchedTo;
    private String badgeClass;
    private String duration;
    private String actionsTaken;
    private String targetUserName;
    private String targetUserEmail;
    private String targetRole;
    private Instant createdAt;
}
