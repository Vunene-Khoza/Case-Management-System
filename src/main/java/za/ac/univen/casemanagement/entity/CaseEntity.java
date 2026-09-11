package za.ac.univen.casemanagement.entity;

import jakarta.persistence.*;
import lombok.*;
import za.ac.univen.casemanagement.enums.CaseClassification;
import za.ac.univen.casemanagement.enums.CaseStatus;
import za.ac.univen.casemanagement.enums.CaseType;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "cases", indexes = {
        @Index(name = "idx_cases_admin_owner_id", columnList = "admin_owner_id"),
        @Index(name = "idx_cases_status", columnList = "status"),
        @Index(name = "idx_cases_type", columnList = "case_type")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CaseEntity {

    @Id
    @Column(name = "case_id", length = 50)
    private String caseId;

    @Column(name = "employee_number", nullable = false, length = 50)
    private String employeeNumber;

    @Column(name = "employee_name", nullable = false, length = 100)
    private String employeeName;

    @Enumerated(EnumType.STRING)
    @Column(name = "case_type", nullable = false, length = 50)
    private CaseType caseType;

    @Enumerated(EnumType.STRING)
    @Column(name = "classification", nullable = false, length = 50)
    private CaseClassification classification;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "date_opened", nullable = false)
    private LocalDate dateOpened;

    @Column(name = "trial_date")
    private LocalDate trialDate;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "case_reminder_dates", joinColumns = @JoinColumn(name = "case_id"))
    @Column(name = "reminder_date")
    @Builder.Default
    private List<LocalDate> reminderDates = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private CaseStatus status;

    @Column(name = "closure_date")
    private LocalDate closureDate;

    @Column(name = "final_notes", columnDefinition = "TEXT")
    private String finalNotes;

    @Column(name = "costing", nullable = false, precision = 15, scale = 2)
    private BigDecimal costing;

    @Column(name = "assigned_officer", length = 150)
    private String assignedOfficer;

    @Column(name = "assigned_role", length = 50)
    private String assignedRole;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "admin_owner_id", nullable = false)
    private Long adminOwnerId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
        updatedAt = Instant.now();
        if (status == null) {
            status = CaseStatus.OPEN;
        }
        if (costing == null) {
            costing = BigDecimal.ZERO;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }
}
