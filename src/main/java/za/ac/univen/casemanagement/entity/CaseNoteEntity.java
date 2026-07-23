package za.ac.univen.casemanagement.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "case_notes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CaseNoteEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "note_id")
    private Long noteId;

    @Column(name = "case_id", nullable = false, length = 50)
    private String caseId;

    @Column(name = "author_id", nullable = false)
    private Long authorId;

    @Column(name = "author_name", nullable = false, length = 100)
    private String authorName;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
