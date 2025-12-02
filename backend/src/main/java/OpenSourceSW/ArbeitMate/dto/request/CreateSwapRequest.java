package OpenSourceSW.ArbeitMate.dto.request;

import OpenSourceSW.ArbeitMate.domain.enums.SwapType;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Getter
@NoArgsConstructor
public class CreateSwapRequest {

    private SwapType type; // GIVE_AWAY(대타) 또는 DIRECT_SWAP(맞교환)
    private UUID fromAssignmentId; // 내 스케줄 ID (ScheduleAssignment ID)
    private UUID toAssignmentId;
    private UUID targetMemberId;
    private String reason;
}