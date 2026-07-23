package za.ac.univen.casemanagement.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import za.ac.univen.casemanagement.dto.request.AddNoteRequest;
import za.ac.univen.casemanagement.dto.request.CloseCaseRequest;
import za.ac.univen.casemanagement.dto.request.CreateCaseRequest;
import za.ac.univen.casemanagement.dto.request.UpdateCaseRequest;
import za.ac.univen.casemanagement.dto.response.ApiResponse;
import za.ac.univen.casemanagement.dto.response.CaseNoteResponse;
import za.ac.univen.casemanagement.dto.response.CaseResponse;
import za.ac.univen.casemanagement.enums.CaseStatus;
import za.ac.univen.casemanagement.enums.CaseType;
import za.ac.univen.casemanagement.service.CaseNoteService;
import za.ac.univen.casemanagement.service.CaseService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/cases")
@RequiredArgsConstructor
public class CaseController {

    private final CaseService caseService;
    private final CaseNoteService caseNoteService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<CaseResponse>>> getCases(
            @RequestParam(required = false) CaseType caseType,
            @RequestParam(required = false) CaseStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<CaseResponse> cases = caseService.getCases(caseType, status, search, pageable);
        return ResponseEntity.ok(ApiResponse.success(200, "Cases retrieved successfully", cases));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CaseResponse>> createCase(@Valid @RequestBody CreateCaseRequest request) {
        CaseResponse created = caseService.createCase(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(201, "Case created successfully", created));
    }

    @GetMapping("/{caseId}")
    public ResponseEntity<ApiResponse<CaseResponse>> getCaseById(@PathVariable String caseId) {
        CaseResponse caseDetails = caseService.getCaseById(caseId);
        return ResponseEntity.ok(ApiResponse.success(200, "Case details retrieved successfully", caseDetails));
    }

    @PutMapping("/{caseId}")
    public ResponseEntity<ApiResponse<CaseResponse>> updateCase(
            @PathVariable String caseId,
            @Valid @RequestBody UpdateCaseRequest request
    ) {
        CaseResponse updated = caseService.updateCase(caseId, request);
        return ResponseEntity.ok(ApiResponse.success(200, "Case updated successfully", updated));
    }

    @PostMapping("/{caseId}/notes")
    public ResponseEntity<ApiResponse<CaseNoteResponse>> addNote(
            @PathVariable String caseId,
            @Valid @RequestBody AddNoteRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        CaseNoteResponse note = caseNoteService.addNote(caseId, request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(201, "Note added successfully", note));
    }

    @GetMapping("/{caseId}/notes")
    public ResponseEntity<ApiResponse<List<CaseNoteResponse>>> getNotes(@PathVariable String caseId) {
        List<CaseNoteResponse> notes = caseNoteService.getNotesByCaseId(caseId);
        return ResponseEntity.ok(ApiResponse.success(200, "Case notes retrieved successfully", notes));
    }

    @PostMapping("/{caseId}/close")
    public ResponseEntity<ApiResponse<CaseResponse>> closeCase(
            @PathVariable String caseId,
            @Valid @RequestBody CloseCaseRequest request
    ) {
        CaseResponse closed = caseService.closeCase(caseId, request);
        return ResponseEntity.ok(ApiResponse.success(200, "Case closed successfully", closed));
    }
}
