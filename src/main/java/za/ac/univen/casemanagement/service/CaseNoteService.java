package za.ac.univen.casemanagement.service;

import za.ac.univen.casemanagement.dto.request.AddNoteRequest;
import za.ac.univen.casemanagement.dto.response.CaseNoteResponse;

import java.util.List;

public interface CaseNoteService {
    CaseNoteResponse addNote(String caseId, AddNoteRequest request, String currentUserEmail);
    List<CaseNoteResponse> getNotesByCaseId(String caseId);
}
