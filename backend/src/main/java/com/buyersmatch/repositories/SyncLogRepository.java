package com.buyersmatch.repositories;

import com.buyersmatch.entities.SyncLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface SyncLogRepository extends JpaRepository<SyncLog, UUID> {
    List<SyncLog> findAllByModuleOrderByStartedAtDesc(String module);
    List<SyncLog> findTop10ByOrderByStartedAtDesc();
}
