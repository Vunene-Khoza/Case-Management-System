package za.ac.univen.casemanagement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import za.ac.univen.casemanagement.enums.UserRole;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private Long userId;
    private String name;
    private String email;
    private UserRole role;
    private String status;
    private Instant createdAt;
}
