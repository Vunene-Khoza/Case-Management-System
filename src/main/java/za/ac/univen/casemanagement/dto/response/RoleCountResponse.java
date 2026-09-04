package za.ac.univen.casemanagement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleCountResponse {
    private long adminCount;
    private long legalOfficerCount;
    private long viewerCount;
    private long superAdminCount;
}
