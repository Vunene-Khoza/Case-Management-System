package za.ac.univen.casemanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import za.ac.univen.casemanagement.entity.ActivityLogEntity;

import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLogEntity, Long> {
    List<ActivityLogEntity> findTop50ByOrderByCreatedAtDesc();
}
