package OpenSourceSW.ArbeitMate.dto.response;

import OpenSourceSW.ArbeitMate.domain.SwapRequest;
import OpenSourceSW.ArbeitMate.domain.enums.SwapStatus;
import OpenSourceSW.ArbeitMate.domain.enums.SwapType;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class SwapRequestResponse {
    private String id;
    private String requesterName;
    private String targetName;
    private SwapType type;
    private SwapStatus status;
    private LocalDateTime createdAt;

    // 어떤 근무를 바꾸는지 정보 (간략하게)
    private String fromScheduleInfo;

    public SwapRequestResponse(SwapRequest req) {
        this.id = req.getId().toString();

        this.requesterName = req.getCreatedBy().getName();

        this.targetName = (req.getProposedTo() != null) ? req.getProposedTo().getName() : "전체 공개";
        this.type = req.getType();
        this.status = req.getStatus();

        this.createdAt = req.getCreatedAt();

        // 날짜/시간 정보 포맷팅 (Null 체크 필수)
        if (req.getFromAssignment() != null && req.getFromAssignment().getSchedule() != null) {
            var s = req.getFromAssignment().getSchedule();
            this.fromScheduleInfo = String.format("%s %s~%s (%s)",
                    s.getWorkDate(), s.getStartTime(), s.getEndTime(), s.getRole().getName());
        }
    }
}