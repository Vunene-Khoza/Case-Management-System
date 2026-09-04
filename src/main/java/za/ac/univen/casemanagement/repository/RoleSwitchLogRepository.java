package za.ac.univen.casemanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import za.ac.univen.casemanagement.entity.RoleSwitchLogEntity;

import java.util.List;

@Repository
public interface RoleSwitchLogRepository extends JpaRepository<RoleSwitchLogEntity, Long> {
    List<RoleSwitchLogEntity> findTop50ByOrderByCreatedAtDesc();
}
