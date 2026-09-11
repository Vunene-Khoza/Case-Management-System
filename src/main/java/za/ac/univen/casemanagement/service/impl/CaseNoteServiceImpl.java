package za.ac.univen.casemanagement.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import za.ac.univen.casemanagement.dto.request.AddNoteRequest;
import za.ac.univen.casemanagement.dto.response.CaseNoteResponse;
import za.ac.univen.casemanagement.entity.CaseNoteEntity;
import za.ac.univen.casemanagement.entity.UserEntity;
import za.ac.univen.casemanagement.enums.ActivityCategory;
import za.ac.univen.casemanagement.exception.ResourceNotFoundException;
import za.ac.univen.casemanagement.repository.CaseNoteRepository;
import za.ac.univen.casemanagement.repository.CaseRepository;
import za.ac.univen.casemanagement.repository.UserRepository;
import za.ac.univen.casemanagement.service.ActivityLogService;
import za.ac.univen.casemanagement.service.CaseNoteService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CaseNoteServiceImpl implements CaseNoteService {

    private final CaseNoteRepository caseNoteRepository;
    private final CaseRepository caseRepository;
    private final UserRepository userRepository;
    private final ActivityLogService activityLogService;
    private final za.ac.univen.casemanagement.security.OwnershipService ownershipService;

    @Override
    @Transactional
    public CaseNoteResponse addNote(String caseId, AddNoteRequest request, String currentUserEmail) {
        za.ac.univen.casemanagement.entity.CaseEntity caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Case not found with ID: " + caseId));

        UserEntity user = (currentUserEmail != null && !currentUserEmail.isBlank())
                ? userRepository.findByEmailIgnoreCase(currentUserEmail).orElseGet(ownershipService::getAuthenticatedUser)
                : ownershipService.getAuthenticatedUser();

        ownershipService.canAccessCase(caseEntity, user);

        CaseNoteEntity note = CaseNoteEntity.builder()
                .caseId(caseId)
                .adminOwnerId(caseEntity.getAdminOwnerId())
                .authorId(user.getUserId())
                .authorName(user.getName())
                .content(request.getContent())
                .build();

        CaseNoteEntity saved = caseNoteRepository.save(note);

        activityLogService.log(
                user.getEmail(),
                ActivityCategory.CASE,
                "NOTE_ADDED",
                "CaseNote",
                caseId,
                "Added formal case note on case " + caseId,
                "SUCCESS",
                null,
                "{\"noteId\":" + saved.getNoteId() + "}"
        );

        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CaseNoteResponse> getNotesByCaseId(String caseId) {
        za.ac.univen.casemanagement.entity.CaseEntity caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Case not found with ID: " + caseId));

        UserEntity currentUser = ownershipService.getAuthenticatedUser();
        ownershipService.canAccessCase(caseEntity, currentUser);

        return caseNoteRepository.findByCaseIdOrderByCreatedAtDesc(caseId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private CaseNoteResponse mapToResponse(CaseNoteEntity entity) {
        return CaseNoteResponse.builder()
                .noteId(entity.getNoteId())
                .caseId(entity.getCaseId())
                .adminOwnerId(entity.getAdminOwnerId())
                .authorId(entity.getAuthorId())
                .authorName(entity.getAuthorName())
                .content(entity.getContent())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
