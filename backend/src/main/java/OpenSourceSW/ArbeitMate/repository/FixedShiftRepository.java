package OpenSourceSW.ArbeitMate.repository;

import OpenSourceSW.ArbeitMate.domain.FixedShift;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface FixedShiftRepository extends JpaRepository<FixedShift, UUID> {
    List<FixedShift> findByCompanyIdAndMemberId(UUID companyId, UUID memberId);

    void deleteByCompanyIdAndMemberId(UUID companyId, UUID memberId);
    boolean existsByCompanyIdAndMemberId(UUID companyId, UUID memberId);
}
