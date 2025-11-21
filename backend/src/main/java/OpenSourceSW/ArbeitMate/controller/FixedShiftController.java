package OpenSourceSW.ArbeitMate.controller;

import OpenSourceSW.ArbeitMate.dto.request.UpdateFixedShiftRequest;
import OpenSourceSW.ArbeitMate.dto.response.FixedShiftResponse;
import OpenSourceSW.ArbeitMate.security.AuthPrincipal;
import OpenSourceSW.ArbeitMate.service.ScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/companies/{companyId}/workers/{companyMemberId}/fixed-shifts")
public class FixedShiftController {

    private final ScheduleService scheduleService;

    /**
     * 고정 근무자 설정 조회
     */
    @GetMapping
    public ResponseEntity<FixedShiftResponse> getFixedShiftConfig(
            @AuthenticationPrincipal AuthPrincipal principal,
            @PathVariable UUID companyId,
            @PathVariable UUID companyMemberId) {

        var res = scheduleService.getFixedShiftConfig(principal.memberId(), companyId, companyMemberId);
        return ResponseEntity.ok(res);
    }

    /**
     * 고정 근무자 설정/변경
     */
    @PutMapping
    public ResponseEntity<FixedShiftResponse> updateFixedShiftConfig(
            @AuthenticationPrincipal AuthPrincipal principal,
            @PathVariable UUID companyId,
            @PathVariable UUID companyMemberId,
            @RequestBody UpdateFixedShiftRequest req) {

        var res =  scheduleService.updateFixedShift(principal.memberId(), companyId, companyMemberId, req);
        return ResponseEntity.ok(res);
    }
}
