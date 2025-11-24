package OpenSourceSW.ArbeitMate.repository;

import OpenSourceSW.ArbeitMate.domain.Notice;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface NoticeRepository extends JpaRepository<Notice, UUID> {

    List<Notice> findAllByCompanyIdOrderByCreatedAtDesc(UUID companyId);
}