package OpenSourceSW.ArbeitMate.dto.response;

import OpenSourceSW.ArbeitMate.domain.Schedule;
import OpenSourceSW.ArbeitMate.domain.enums.AssignmentStatus; // 이게 있는지 확인 필요
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Data
@Builder
public class ScheduleResponse {

    UUID scheduleId;
    UUID roleId;
    String roleName;
    LocalDate workDate;
    LocalTime startTime;
    LocalTime endTime;
    int requiredHeadCount;

    int currentHeadCount;
    List<String> workerNames;

    public static ScheduleResponse from(Schedule s) {

        List<String> names = s.getAssignments().stream()
                .filter(a -> a.getStatus() == AssignmentStatus.ASSIGNED)
                .map(a -> a.getMember().getName()) // Member의 이름 추출
                .collect(Collectors.toList());

        return ScheduleResponse.builder()
                .scheduleId(s.getId())
                .roleId(s.getRole().getId())
                .roleName(s.getRole().getName())
                .workDate(s.getWorkDate())
                .startTime(s.getStartTime())
                .endTime(s.getEndTime())
                .requiredHeadCount(s.getRequiredHeadcount())

               .workerNames(names)
                .currentHeadCount(names.size())
                .build();
    }
}