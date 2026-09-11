package za.ac.univen.casemanagement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import za.ac.univen.casemanagement.enums.ActivityCategory;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityLogResponse {
    private String id;
    private Instant timestamp;
    private String userId;
    private String userName;
    private String userEmail;
    private String userRole;
    private String userAvatar;
    private ActivityCategory category;
    private String action;
    private String entityType;
    private String entityId;
    private String description;
    private String ipAddress;
    private String status;
    private String detailsJson;
    private String actorAdminOwner;
    private Long adminOwnerId;
}
