package za.ac.univen.casemanagement.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;
import za.ac.univen.casemanagement.dto.request.CloseCaseRequest;
import za.ac.univen.casemanagement.dto.request.CreateCaseRequest;
import za.ac.univen.casemanagement.dto.request.UpdateCaseRequest;
import za.ac.univen.casemanagement.dto.response.CaseResponse;
import za.ac.univen.casemanagement.entity.CaseEntity;
import za.ac.univen.casemanagement.enums.ActivityCategory;
import za.ac.univen.casemanagement.enums.CaseStatus;
import za.ac.univen.casemanagement.enums.CaseType;
import za.ac.univen.casemanagement.exception.BadRequestException;
import za.ac.univen.casemanagement.exception.ResourceNotFoundException;
import za.ac.univen.casemanagement.repository.CaseRepository;
import za.ac.univen.casemanagement.service.ActivityLogService;
import za.ac.univen.casemanagement.service.CaseService;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class CaseServiceImpl implements CaseService {

    private final CaseRepository caseRepository;
    private final ActivityLogService activityLogService;

    @Override
    @Transactional(readOnly = true)
    public Page<CaseResponse> getCases(CaseType caseType, CaseStatus status, String search, Pageable pageable) {
        Page<CaseEntity> caseEntities = caseRepository.searchCases(caseType, status, search, pageable);
        return caseEntities.map(this::mapToResponse);
    }

    @Override
    @Transactional
    public CaseResponse createCase(CreateCaseRequest request) {
        if (request.getDateOpened() != null && request.getDateOpened().isAfter(LocalDate.now())) {
            throw new BadRequestException("dateOpened cannot be in the future");
        }

        String nextCaseId = generateNextCaseId();

        CaseEntity entity = CaseEntity.builder()
                .caseId(nextCaseId)
                .employeeNumber(request.getEmployeeNumber())
                .employeeName(request.getEmployeeName())
                .caseType(request.getCaseType())
                .classification(request.getClassification())
                .description(request.getDescription())
                .dateOpened(request.getDateOpened())
                .trialDate(request.getTrialDate())
                .reminderDates(request.getReminderDates())
                .status(CaseStatus.OPEN)
                .costing(request.getCosting() != null ? request.getCosting() : BigDecimal.ZERO)
                .assignedOfficer(request.getAssignedOfficer())
                .assignedRole(request.getAssignedRole() != null ? request.getAssignedRole() : (request.getAssignedOfficer() != null ? "Legal Officer" : null))
                .build();

        CaseEntity saved = caseRepository.save(entity);

        String actorEmail = SecurityContextHolder.getContext().getAuthentication() != null
                ? SecurityContextHolder.getContext().getAuthentication().getName()
                : "system@univen.ac.za";
        activityLogService.log(
                actorEmail,
                ActivityCategory.CASE,
                "CASE_CREATED",
                "Case",
                saved.getCaseId(),
                "Registered new " + saved.getCaseType() + " case " + saved.getCaseId() + " for " + saved.getEmployeeName(),
                "SUCCESS",
                null,
                "{\"caseType\":\"" + saved.getCaseType() + "\",\"costing\":" + saved.getCosting() + "}"
        );

        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public CaseResponse getCaseById(String caseId) {
        CaseEntity entity = caseRepository.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Case not found with ID: " + caseId));
        return mapToResponse(entity);
    }

    @Override
    @Transactional
    public CaseResponse updateCase(String caseId, UpdateCaseRequest request) {
        CaseEntity entity = caseRepository.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Case not found with ID: " + caseId));

        if (request.getEmployeeNumber() != null) {
            entity.setEmployeeNumber(request.getEmployeeNumber());
        }
        if (request.getEmployeeName() != null) {
            entity.setEmployeeName(request.getEmployeeName());
        }
        if (request.getCaseType() != null) {
            entity.setCaseType(request.getCaseType());
        }
        if (request.getClassification() != null) {
            entity.setClassification(request.getClassification());
        }
        if (request.getDescription() != null) {
            entity.setDescription(request.getDescription());
        }
        if (request.getTrialDate() != null) {
            entity.setTrialDate(request.getTrialDate());
        }
        if (request.getReminderDates() != null) {
            entity.setReminderDates(request.getReminderDates());
        }
        if (request.getCosting() != null) {
            entity.setCosting(request.getCosting());
        }
        if (request.getStatus() != null) {
            entity.setStatus(request.getStatus());
        }
        if (request.getAssignedOfficer() != null) {
            entity.setAssignedOfficer(request.getAssignedOfficer());
        }
        if (request.getAssignedRole() != null) {
            entity.setAssignedRole(request.getAssignedRole());
        }

        CaseEntity updated = caseRepository.save(entity);

        String actorEmail = SecurityContextHolder.getContext().getAuthentication() != null
                ? SecurityContextHolder.getContext().getAuthentication().getName()
                : "system@univen.ac.za";
        activityLogService.log(
                actorEmail,
                ActivityCategory.CASE,
                "CASE_UPDATED",
                "Case",
                updated.getCaseId(),
                "Updated case details for " + updated.getCaseId() + " (" + updated.getEmployeeName() + ")",
                "SUCCESS",
                null,
                "{\"status\":\"" + updated.getStatus() + "\"}"
        );

        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public CaseResponse closeCase(String caseId, CloseCaseRequest request) {
        CaseEntity entity = caseRepository.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Case not found with ID: " + caseId));

        if (request.getClosureDate().isBefore(entity.getDateOpened())) {
            throw new BadRequestException("closureDate must be on or after dateOpened (" + entity.getDateOpened() + ")");
        }

        entity.setClosureDate(request.getClosureDate());
        entity.setFinalNotes(request.getFinalNotes());
        if (request.getCosting() != null) {
            entity.setCosting(request.getCosting());
        }
        entity.setStatus(CaseStatus.CLOSED);

        CaseEntity closed = caseRepository.save(entity);

        String actorEmail = SecurityContextHolder.getContext().getAuthentication() != null
                ? SecurityContextHolder.getContext().getAuthentication().getName()
                : "system@univen.ac.za";
        activityLogService.log(
                actorEmail,
                ActivityCategory.CASE,
                "CASE_CLOSED",
                "Case",
                closed.getCaseId(),
                "Closed case " + closed.getCaseId() + " (" + closed.getEmployeeName() + ") with final costing R " + closed.getCosting(),
                "SUCCESS",
                null,
                "{\"closureDate\":\"" + closed.getClosureDate() + "\",\"finalCost\":" + closed.getCosting() + "}"
        );

        return mapToResponse(closed);
    }

    private synchronized String generateNextCaseId() {
        return caseRepository.findMaxCaseId()
                .map(maxId -> {
                    try {
                        int num = Integer.parseInt(maxId.substring(1));
                        return String.format("C%03d", num + 1);
                    } catch (NumberFormatException e) {
                        return "C001";
                    }
                })
                .orElse("C001");
    }

    private CaseResponse mapToResponse(CaseEntity entity) {
        return CaseResponse.builder()
                .caseId(entity.getCaseId())
                .employeeNumber(entity.getEmployeeNumber())
                .employeeName(entity.getEmployeeName())
                .caseType(entity.getCaseType())
                .classification(entity.getClassification())
                .description(entity.getDescription())
                .dateOpened(entity.getDateOpened())
                .trialDate(entity.getTrialDate())
                .reminderDates(entity.getReminderDates())
                .status(entity.getStatus())
                .closureDate(entity.getClosureDate())
                .finalNotes(entity.getFinalNotes())
                .costing(entity.getCosting())
                .assignedOfficer(entity.getAssignedOfficer())
                .assignedRole(entity.getAssignedRole())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
