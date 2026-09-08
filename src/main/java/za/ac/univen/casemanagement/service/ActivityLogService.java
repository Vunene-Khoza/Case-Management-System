package za.ac.univen.casemanagement.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import za.ac.univen.casemanagement.dto.request.CreateActivityLogRequest;
import za.ac.univen.casemanagement.dto.request.RoleSwitchLogRequest;
import za.ac.univen.casemanagement.dto.response.ActivityLogResponse;
import za.ac.univen.casemanagement.enums.ActivityCategory;

public interface ActivityLogService {

    void log(String userEmail,
             ActivityCategory category,
             String action,
             String entityType,
             String entityId,
             String description,
             String status,
             String ipAddress,
             String detailsJson);

    Page<ActivityLogResponse> getLogs(ActivityCategory category,
                                      String status,
                                      String search,
                                      Pageable pageable,
                                      Authentication authentication,
                                      String previewRole,
                                      String previewEmail);

    ActivityLogResponse recordCustomEvent(CreateActivityLogRequest request,
                                          Authentication authentication,
                                          String ipAddress);

    ActivityLogResponse recordRoleSwitch(RoleSwitchLogRequest request,
                                         Authentication authentication,
                                         String ipAddress);
}
