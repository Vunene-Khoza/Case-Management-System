package za.ac.univen.casemanagement.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import za.ac.univen.casemanagement.entity.CaseEntity;
import za.ac.univen.casemanagement.enums.CaseStatus;
import za.ac.univen.casemanagement.enums.CaseType;

import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface CaseRepository extends JpaRepository<CaseEntity, String> {

    long countByStatus(CaseStatus status);
    long countByCaseType(CaseType caseType);

    long countByAdminOwnerId(Long adminOwnerId);
    long countByStatusAndAdminOwnerId(CaseStatus status, Long adminOwnerId);
    long countByCaseTypeAndAdminOwnerId(CaseType caseType, Long adminOwnerId);

    @Query("SELECT SUM(c.costing) FROM CaseEntity c")
    BigDecimal sumTotalCosting();

    @Query("SELECT COALESCE(SUM(c.costing), 0) FROM CaseEntity c WHERE c.adminOwnerId = :adminOwnerId")
    BigDecimal sumTotalCostingByAdminOwnerId(@Param("adminOwnerId") Long adminOwnerId);

    @Query("SELECT c FROM CaseEntity c WHERE " +
           "(:isSuperAdmin = true OR c.adminOwnerId = :adminOwnerId) AND " +
           "(:caseType IS NULL OR c.caseType = :caseType) AND " +
           "(:status IS NULL OR c.status = :status) AND " +
           "(:search IS NULL OR LOWER(c.employeeName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.employeeNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.caseId) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<CaseEntity> searchScopedCases(@Param("isSuperAdmin") boolean isSuperAdmin,
                                       @Param("adminOwnerId") Long adminOwnerId,
                                       @Param("caseType") CaseType caseType,
                                       @Param("status") CaseStatus status,
                                       @Param("search") String search,
                                       Pageable pageable);

    Optional<CaseEntity> findByCaseIdAndAdminOwnerId(String caseId, Long adminOwnerId);

    @Query("SELECT MAX(c.caseId) FROM CaseEntity c WHERE c.caseId LIKE 'C%'")
    Optional<String> findMaxCaseId();
}
