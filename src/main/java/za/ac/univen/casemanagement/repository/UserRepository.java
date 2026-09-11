package za.ac.univen.casemanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import za.ac.univen.casemanagement.entity.UserEntity;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long> {
    Optional<UserEntity> findByEmail(String email);
    Optional<UserEntity> findByEmailIgnoreCase(String email);
    boolean existsByEmail(String email);

    Optional<UserEntity> findByEmployeeNumber(String employeeNumber);
    boolean existsByEmployeeNumber(String employeeNumber);

    java.util.List<UserEntity> findByRole(za.ac.univen.casemanagement.enums.UserRole role);
    java.util.List<UserEntity> findByRoleAndStatus(za.ac.univen.casemanagement.enums.UserRole role, String status);
    java.util.List<UserEntity> findByCreatedByIgnoreCase(String createdBy);
    boolean existsByUserIdAndCreatedByIgnoreCase(Long userId, String createdBy);
    java.util.List<UserEntity> findByAdminOwnerId(Long adminOwnerId);
    java.util.List<UserEntity> findByAdminOwnerIdAndRole(Long adminOwnerId, za.ac.univen.casemanagement.enums.UserRole role);
    java.util.List<UserEntity> findByAdminOwnerIdAndRoleNot(Long adminOwnerId, za.ac.univen.casemanagement.enums.UserRole role);
    Optional<UserEntity> findByUserIdAndAdminOwnerId(Long userId, Long adminOwnerId);
    boolean existsByUserIdAndAdminOwnerId(Long userId, Long adminOwnerId);
    long countByRoleAndStatus(za.ac.univen.casemanagement.enums.UserRole role, String status);
    long countByRole(za.ac.univen.casemanagement.enums.UserRole role);
}
