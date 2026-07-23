package za.ac.univen.casemanagement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CaseNoteResponse {
    private Long noteId;
    private String caseId;
    private Long authorId;
    private String authorName;
    private String content;
    private Instant createdAt;
}
