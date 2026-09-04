package za.ac.univen.casemanagement.entity;

import jakarta.persistence.*;
import lombok.*;
import za.ac.univen.casemanagement.enums.UserRole;

import java.time.Instant;

@Entity
@Table(name = "role_switch_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoleSwitchLogEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "log_id")
    private Long logId;

    @Column(name = "super_admin_email", nullable = false)
    private String superAdminEmail;

    @Column(name = "target_user_id")
    private Long targetUserId;

    @Column(name = "target_user_name", nullable = false)
    private String targetUserName;

    @Column(name = "target_user_email", nullable = false)
    private String targetUserEmail;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_role", nullable = false)
    private UserRole targetRole;

    @Column(name = "duration")
    private String duration;

    @Column(name = "actions_taken", columnDefinition = "TEXT")
    private String actionsTaken;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
