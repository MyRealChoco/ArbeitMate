package OpenSourceSW.ArbeitMate.controller;

import OpenSourceSW.ArbeitMate.dto.request.CreateSwapRequest;
import OpenSourceSW.ArbeitMate.dto.response.SwapRequestResponse;
import OpenSourceSW.ArbeitMate.security.AuthPrincipal;
import OpenSourceSW.ArbeitMate.service.SwapRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/companies/{companyId}/swaps")
@RequiredArgsConstructor
public class SwapRequestController {

    private final SwapRequestService swapRequestService;

    // 1. 교환/대타 요청 생성 (알바생)
    // POST /companies/{companyId}/swaps
    @PostMapping
    public ResponseEntity<String> createRequest(
            @AuthenticationPrincipal AuthPrincipal principal,
            @PathVariable UUID companyId,
            @RequestBody CreateSwapRequest request) {

        UUID requestId = swapRequestService.createRequest(principal.memberId(), companyId, request);
        return ResponseEntity.ok("요청 생성 완료: " + requestId);
    }

    // 2. 요청 수락 (대상 알바생)
    // POST /companies/{companyId}/swaps/{requestId}/accept
    @PostMapping("/{requestId}/accept")
    public ResponseEntity<String> acceptRequest(
            @AuthenticationPrincipal AuthPrincipal principal,
            @PathVariable UUID companyId,
            @PathVariable UUID requestId) {

        swapRequestService.acceptRequest(principal.memberId(), requestId);
        return ResponseEntity.ok("요청 수락 완료 (사장님 승인 대기)");
    }

    // 3. 최종 승인 (사장님)
    // POST /companies/{companyId}/swaps/{requestId}/approve
    @PostMapping("/{requestId}/approve")
    public ResponseEntity<String> approveRequest(
            @AuthenticationPrincipal AuthPrincipal principal,
            @PathVariable UUID companyId,
            @PathVariable UUID requestId) {

        swapRequestService.approveRequest(principal.memberId(), requestId);
        return ResponseEntity.ok("최종 승인 완료 (근무표 변경됨)");
    }

    // 4. 거절 (대상자 또는 사장님)
    // POST /companies/{companyId}/swaps/{requestId}/decline
    @PostMapping("/{requestId}/decline")
    public ResponseEntity<String> declineRequest(
            @AuthenticationPrincipal AuthPrincipal principal,
            @PathVariable UUID companyId,
            @PathVariable UUID requestId) {

        swapRequestService.declineRequest(principal.memberId(), requestId);
        return ResponseEntity.ok("요청 거절 완료");
    }

    // 5. 내 요청 조회 (알바생용)
    // GET /companies/{companyId}/swaps/my
    @GetMapping("/my")
    public ResponseEntity<List<SwapRequestResponse>> getMyRequests(
            @AuthenticationPrincipal AuthPrincipal principal,
            @PathVariable UUID companyId) {

        return ResponseEntity.ok(swapRequestService.getMyRequests(principal.memberId()));
    }

    // 6. 매장 전체 요청 조회 (사장님용)
    // GET /companies/{companyId}/swaps
    @GetMapping
    public ResponseEntity<List<SwapRequestResponse>> getCompanyRequests(
            @PathVariable UUID companyId) {

        return ResponseEntity.ok(swapRequestService.getCompanyRequests(companyId));
    }
}