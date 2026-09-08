package za.ac.univen.casemanagement.entity;

import jakarta.persistence.*;
import lombok.*;
import za.ac.univen.casemanagement.enums.ActivityCategory;

import java.time.Instant;

@Entity
@Table(name = "activity_logs", indexes = {
        @Index(name = "idx_activity_timestamp", columnList = "timestamp"),
        @Index(name = "idx_activity_user_email", columnList = "user_email"),
        @Index(name = "idx_activity_actor_admin_owner", columnList = "actor_admin_owner"),
        @Index(name = "idx_activity_category", columnList = "category")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityLogEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "log_id")
    private Long id;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "timestamp", nullable = false)
    private Instant timestamp;

    @Column(name = "user_id", length = 50)
    private String userId;

    @Column(name = "user_email", nullable = false, length = 100)
    private String userEmail;

    @Column(name = "user_name", nullable = false, length = 100)
    private String userName;

    @Column(name = "user_role", nullable = false, length = 50)
    private String userRole;

    @Column(name = "user_avatar", length = 100)
    private String userAvatar;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 50)
    private ActivityCategory category;

    @Column(name = "action", nullable = false, length = 50)
    private String action;

    @Column(name = "entity_type", nullable = false, length = 50)
    private String entityType;

    @Column(name = "entity_id", length = 50)
    private String entityId;

    @Column(name = "description", columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    @Column(name = "status", nullable = false, length = 50)
    private String status;

    @Column(name = "details_json", columnDefinition = "TEXT")
    private String detailsJson;

    @Column(name = "actor_admin_owner", length = 100)
    private String actorAdminOwner;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
        if (timestamp == null) {
            timestamp = Instant.now();
        }
        if (status == null) {
            status = "SUCCESS";
        }
        if (ipAddress == null) {
            ipAddress = "127.0.0.1";
        }
    }
}
