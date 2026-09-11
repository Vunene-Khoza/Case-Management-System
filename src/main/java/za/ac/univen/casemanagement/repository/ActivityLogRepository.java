package za.ac.univen.casemanagement.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import za.ac.univen.casemanagement.entity.ActivityLogEntity;
import za.ac.univen.casemanagement.enums.ActivityCategory;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLogEntity, Long> {

    @Query("SELECT a FROM ActivityLogEntity a WHERE " +
           "(:isSuperAdmin = true OR " +
           " (:isAdmin = true AND (a.adminOwnerId = :adminOwnerId OR LOWER(a.actorAdminOwner) = LOWER(:adminEmail))) OR " +
           " (:isOfficer = true AND (LOWER(a.userEmail) = LOWER(:userEmail) OR (:adminOwnerId IS NOT NULL AND a.adminOwnerId = :adminOwnerId)))) AND " +
           "(:category IS NULL OR a.category = :category) AND " +
           "(:status IS NULL OR a.status = :status) AND " +
           "(:search IS NULL OR " +
           " LOWER(a.userName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(a.action) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<ActivityLogEntity> findScopedLogs(
            @Param("isSuperAdmin") boolean isSuperAdmin,
            @Param("isAdmin") boolean isAdmin,
            @Param("adminEmail") String adminEmail,
            @Param("adminOwnerId") Long adminOwnerId,
            @Param("isOfficer") boolean isOfficer,
            @Param("userEmail") String userEmail,
            @Param("category") ActivityCategory category,
            @Param("status") String status,
            @Param("search") String search,
            Pageable pageable);

    @Query("SELECT COUNT(a) FROM ActivityLogEntity a WHERE " +
           "(:isSuperAdmin = true OR " +
           " (:isAdmin = true AND (a.adminOwnerId = :adminOwnerId OR LOWER(a.actorAdminOwner) = LOWER(:adminEmail))) OR " +
           " (:isOfficer = true AND (LOWER(a.userEmail) = LOWER(:userEmail) OR (:adminOwnerId IS NOT NULL AND a.adminOwnerId = :adminOwnerId)))) AND " +
           "(:category IS NULL OR a.category = :category)")
    long countScopedByCategory(
            @Param("isSuperAdmin") boolean isSuperAdmin,
            @Param("isAdmin") boolean isAdmin,
            @Param("adminEmail") String adminEmail,
            @Param("adminOwnerId") Long adminOwnerId,
            @Param("isOfficer") boolean isOfficer,
            @Param("userEmail") String userEmail,
            @Param("category") ActivityCategory category);
}
