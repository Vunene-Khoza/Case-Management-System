package za.ac.univen.casemanagement.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import za.ac.univen.casemanagement.dto.request.AddNoteRequest;
import za.ac.univen.casemanagement.dto.response.CaseNoteResponse;
import za.ac.univen.casemanagement.entity.CaseNoteEntity;
import za.ac.univen.casemanagement.entity.UserEntity;
import za.ac.univen.casemanagement.exception.ResourceNotFoundException;
import za.ac.univen.casemanagement.repository.CaseNoteRepository;
import za.ac.univen.casemanagement.repository.CaseRepository;
import za.ac.univen.casemanagement.repository.UserRepository;
import za.ac.univen.casemanagement.service.CaseNoteService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CaseNoteServiceImpl implements CaseNoteService {

    private final CaseNoteRepository caseNoteRepository;
    private final CaseRepository caseRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public CaseNoteResponse addNote(String caseId, AddNoteRequest request, String currentUserEmail) {
        if (!caseRepository.existsById(caseId)) {
            throw new ResourceNotFoundException("Case not found with ID: " + caseId);
        }

        UserEntity user = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + currentUserEmail));

        CaseNoteEntity note = CaseNoteEntity.builder()
                .caseId(caseId)
                .authorId(user.getUserId())
                .authorName(user.getName())
                .content(request.getContent())
                .build();

        CaseNoteEntity saved = caseNoteRepository.save(note);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CaseNoteResponse> getNotesByCaseId(String caseId) {
        if (!caseRepository.existsById(caseId)) {
            throw new ResourceNotFoundException("Case not found with ID: " + caseId);
        }
        return caseNoteRepository.findByCaseIdOrderByCreatedAtDesc(caseId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private CaseNoteResponse mapToResponse(CaseNoteEntity entity) {
        return CaseNoteResponse.builder()
                .noteId(entity.getNoteId())
                .caseId(entity.getCaseId())
                .authorId(entity.getAuthorId())
                .authorName(entity.getAuthorName())
                .content(entity.getContent())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
