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
    private String surname;
    private String email;
    private String employeeNumber;
    private String phoneNumber;
    private String idNumber;
    private String department;
    private UserRole role;
    private String status;
    private boolean mustChangePassword;
    private boolean firstLoginCompleted;
    private Instant lastLogin;
    private String createdBy;
    private Long adminOwnerId;
    private Instant createdAt;
}
