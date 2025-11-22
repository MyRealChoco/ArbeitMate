package OpenSourceSW.ArbeitMate.dto.response;

import OpenSourceSW.ArbeitMate.domain.Member;
import OpenSourceSW.ArbeitMate.domain.ScheduleAssignment;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class ScheduleAssignmentWorkerResponse {
    UUID memberId;
    String memberName;

    public static ScheduleAssignmentWorkerResponse from(ScheduleAssignment a) {
        Member m = a.getMember();
        return ScheduleAssignmentWorkerResponse.builder()
                .memberId(m.getId())
                .memberName(m.getName())
                .build();
    }
}
