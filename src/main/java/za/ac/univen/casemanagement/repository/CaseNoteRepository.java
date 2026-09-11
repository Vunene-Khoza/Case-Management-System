package za.ac.univen.casemanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import za.ac.univen.casemanagement.entity.CaseNoteEntity;

import java.util.List;

@Repository
public interface CaseNoteRepository extends JpaRepository<CaseNoteEntity, Long> {
    List<CaseNoteEntity> findByCaseIdOrderByCreatedAtDesc(String caseId);
    List<CaseNoteEntity> findByCaseIdAndAdminOwnerIdOrderByCreatedAtDesc(String caseId, Long adminOwnerId);
}
