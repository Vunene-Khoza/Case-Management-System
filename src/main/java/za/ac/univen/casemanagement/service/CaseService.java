package za.ac.univen.casemanagement.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import za.ac.univen.casemanagement.dto.request.CloseCaseRequest;
import za.ac.univen.casemanagement.dto.request.CreateCaseRequest;
import za.ac.univen.casemanagement.dto.request.UpdateCaseRequest;
import za.ac.univen.casemanagement.dto.response.CaseResponse;
import za.ac.univen.casemanagement.enums.CaseStatus;
import za.ac.univen.casemanagement.enums.CaseType;

public interface CaseService {
    Page<CaseResponse> getCases(CaseType caseType, CaseStatus status, String search, Pageable pageable);
    CaseResponse createCase(CreateCaseRequest request);
    CaseResponse getCaseById(String caseId);
    CaseResponse updateCase(String caseId, UpdateCaseRequest request);
    CaseResponse closeCase(String caseId, CloseCaseRequest request);
}
