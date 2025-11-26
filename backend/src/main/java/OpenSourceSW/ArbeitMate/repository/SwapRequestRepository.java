package OpenSourceSW.ArbeitMate.repository;

import OpenSourceSW.ArbeitMate.domain.SwapRequest;
import OpenSourceSW.ArbeitMate.domain.enums.SwapStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SwapRequestRepository extends JpaRepository<SwapRequest, UUID> {
    List<SwapRequest> findByCompanyIdAndStatus(UUID companyId, SwapStatus status);

    List<SwapRequest> findByCompanyIdOrderByCreatedAtDesc(UUID companyId);

   @Query("SELECT s FROM SwapRequest s " +
            "WHERE s.createdBy.id = :memberId " +
            "OR s.proposedTo.id = :memberId " +
            "OR (s.type = 'GIVE_AWAY' AND s.proposedTo IS NULL) " +
            "ORDER BY s.createdAt DESC")
    List<SwapRequest> findAllMyRelatedRequests(@Param("memberId") UUID memberId);

}