package za.ac.univen.casemanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AddNoteRequest {
    @NotBlank(message = "content is required")
    private String content;
}
